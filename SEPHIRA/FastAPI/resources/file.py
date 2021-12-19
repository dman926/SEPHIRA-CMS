from fastapi import APIRouter
from config import APISettings

from fastapi import Depends, UploadFile, File, Form, Header, BackgroundTasks, Response
from starlette.responses import StreamingResponse
from typing import Optional
from pydantic import BaseModel
from modules.JWT import get_jwt_identity

from mongoengine.errors import DoesNotExist, NotUniqueError
from resources.errors import NotFoundError, SchemaValidationError, UnauthorizedError, AlreadyExistsError, MediaProcessingError
from database.models import User, Media

from config import FileSettings

import mimetypes
from io import BytesIO
from subprocess import Popen, PIPE, SubprocessError
from json import loads
from os import mkdir, listdir, remove, rmdir, path
from uuid import uuid4

router = APIRouter(
	prefix=APISettings.ROUTE_BASE + 'file',
	tags=['File']
)

###########
# HELPERS #
###########

def allowed_file(filename: str) -> bool:
	if FileSettings.ALLOWED_EXTENSIONS == '*':
		return True
	return '.' in filename and filename.rsplit('.', 1)[1].lower() in FileSettings.ALLOWED_EXTENSIONS

def processMedia(file: UploadFile, filename: str, folder: str, mimetype: str, owner: str) -> None:
	try:
		media = None
		file_format = filename.rsplit('.', 1)[1]
		requestedFileName = filename

		# Use ffmpeg to move metadata to the front
		filename = None
		while filename == None:
			filename = str(uuid4())
			if path.isfile(f'media_processing/{filename}.{file_format}'):
				filename == None
		filename2 = None
		while filename2 == None:
			filename2 = str(uuid4())
			if path.isfile(f'media_processing/{filename2}.{file_format}'):
				filename2 == None
		if not path.isdir('media_processing'):
			mkdir('media_processing')
		with open(f'media_processing/{filename}.{file_format}', 'wb+') as file_obj:
			file_obj.write(file.file.read())
			file_obj.close()
		args = ['ffmpeg', '-i', f'media_processing/{filename}.{file_format}', '-c', 'copy', '-movflags', '+faststart', '-v', 'quiet', f'media_processing/{filename2}.{file_format}']
		p = Popen(args)
		if p.wait() != 0:
			raise MediaProcessingError
		remove(f'media_processing/{filename}.{file_format}')
		mkdir(f'media_processing/{filename}')

		args = ['ffprobe', '-show_streams', '-of', 'json', '-v', 'quiet', f'media_processing/{filename2}.{file_format}']
		p = Popen(args, stdout=PIPE)
		out = p.communicate()[0]
		if p.wait() != 0:
			raise SubprocessError
		streams = loads(out)['streams']

		for stream in streams:
			# Create the main media object (video component)
			if 'codec_type' in stream:
				if stream['codec_type'] == 'video' and 'index' in stream:
					video_filename = str(uuid4())
					args = ['ffmpeg', '-i', f'media_processing/{filename2}.{file_format}', '-map', '0:' + str(stream['index']), '-v', 'quiet', f'media_processing/{filename}/{video_filename}.{FileSettings.VIDEO_EXTENSION}']
					p = Popen(args)
					p.communicate()
					if p.wait() != 0:
						raise SubprocessError
					with open(f'media_processing/{filename}/{video_filename}.{FileSettings.VIDEO_EXTENSION}', 'rb') as video_file_obj:
						media = Media(owner=owner, filename=f'{requestedFileName.rsplit(".", 1)[0]}.{FileSettings.VIDEO_EXTENSION}', folder=folder, processing=True)
						mimetype = mimetypes.guess_type(f'{video_filename}.{FileSettings.VIDEO_EXTENSION}')[0]
						if mimetype == None:
							mimetype = f'video/{FileSettings.VIDEO_EXTENSION}'
						media.file.put(video_file_obj, content_type=mimetype)
						media.save()
				remove(f'media_processing/{filename}/{video_filename}.{FileSettings.VIDEO_EXTENSION}')
				break # Only allow the first video stream

		for stream in streams:
			# Create sub media objects (audio/subtitles)
			if 'codec_type' in stream and 'index' in stream:
				if stream['codec_type'] == 'audio':
					audio_filename = str(uuid4())
					args = ['ffmpeg', '-i', f'media_processing/{filename2}.{file_format}', '-map', '0:' + str(stream['index']), '-v', 'quiet', f'media_processing/{filename}/{audio_filename}.{FileSettings.AUDIO_EXTENSION}']
					p = Popen(args)
					p.communicate()[0]
					if p.wait() != 0:
						raise SubprocessError					
					with open(f'media_processing/{filename}/{audio_filename}.{FileSettings.AUDIO_EXTENSION}', 'rb') as audio_file_obj:
						subMedia = Media(owner=owner, filename=f'{requestedFileName.rsplit(".", 1)[0]}.{FileSettings.AUDIO_EXTENSION}', folder=folder, private=True)
						mimetype = mimetypes.guess_type(f'{audio_filename}.{FileSettings.AUDIO_EXTENSION}')[0]
						if mimetype == None:
							mimetype = f'audio/{FileSettings.AUDIO_EXTENSION}'
						subMedia.file.put(audio_file_obj, content_type=mimetype)
						subMedia.save()
						media.update(push__associatedMedia=subMedia)
					remove(f'media_processing/{filename}/{audio_filename}.{FileSettings.AUDIO_EXTENSION}')
				elif stream['codec_type'] == 'subtitle':
					subtitle_filename = str(uuid4())
					args = ['ffmpeg', '-f', f'media_processing/{filename2}.{file_format}', '-map', '0:' + str(stream['index']), '-v', 'quiet', f'media_processing/{filename}/{subtitle_filename}.{FileSettings.SUBTITLE_EXTENSION}']
					p = Popen(args)
					p.communicate()[0]
					if p.wait() != 0:
						raise SubprocessError					
					with open(f'media_processing/{filename}/{subtitle_filename}.{FileSettings.SUBTITLE_EXTENSION}', 'rb') as subtitle_file_obj:
						subMedia = Media(owner=owner, filename=f'{requestedFileName.rsplit(".", 1)[0]}.{FileSettings.SUBTITLE_EXTENSION}', folder=folder, private=True)
						mimetype = mimetypes.guess_type(f'{subtitle_filename}.{FileSettings.SUBTITLE_EXTENSION}')[0]
						if mimetype == None:
							mimetype = f'text/{FileSettings.SUBTITLE_EXTENSION}'
						subMedia.file.put(subtitle_file_obj, content_type=mimetype)
						subMedia.save()
						media.update(push__associatedMedia=subMedia)
					remove(f'media_processing/{filename}/{subtitle_filename}.{FileSettings.SUBTITLE_EXTENSION}')
		media.reload()
		media.processing = False
		media.save()
	except Exception:
		# Clean up media and sub-media objects
		if media:
			media.reload()
			for subMedia in media.associatedMedia:
				subMedia = subMedia.fetch()
				if subMedia.private:
					subMedia.delete()
			media.delete()
	finally:
		# Clean up temp files
		try:
			for f in listdir(f'media_processing/{filename}'):
				remove(f'media_processing/{filename}/{f}')
			rmdir(f'media_processing/{filename}')
		except FileNotFoundError:
			pass # Directory doesn't exist. Ignore
		remove(f'media_processing/{filename2}.{file_format}')
		if len(listdir('media_processing')) == 0:
			rmdir('media_processing')

###########
# SCHEMAS #
###########


class FolderForm(BaseModel):
	folder: str


class MetadataForm(BaseModel):
	metadata: dict

##########
# ROUTES #
##########

@router.post('/upload')
async def upload_file(background_tasks: BackgroundTasks, response: Response, file: UploadFile = File(...), folder: Optional[str] = Form(''), childOf: Optional[str] = Form(''), identity: str = Depends(get_jwt_identity)):
	try:
		if file.filename == '' or (len(folder) > 0 and folder[0] == '/'):
			raise SchemaValidationError
		User.objects.get(id=identity) # make sure the user exists
		if allowed_file(file.filename):
			# Handle filename collisions
			filename = file.filename
			counter = 2
			while True:
				try:
					Media.objects.get(filename=filename, folder=folder)
					newFilename = filename
					filenameSplit = newFilename.rsplit('.', 1)
					filename = filenameSplit[0] + '_' + str(counter) + '.' + filenameSplit[1]
					counter += 1
				except DoesNotExist:
					break
			mimetype = file.content_type
			if not mimetype:
				mimetype = mimetypes.MimeTypes().guess_type(filename)
			
			if FileSettings.ENABLE_FFMPEG and FileSettings.ENABLE_FILE_PROCESSING and mimetype[:5] == 'video':
				# Process the file
				#background_tasks.add_task(processMedia, file, filename, folder, mimetype, identity)
				response.status_code = 202
				processMedia(file, filename, folder, mimetype, identity)
				return 'processing...'
			else:
				media = Media(owner=identity, filename=filename, folder=folder)
				media.file.put(file.file, content_type=mimetype)
				media.save()

				for parent in childOf.split(','):
					try:
						if parent:
							Media.objects.get(id=parent).update(push__associatedMedia=media)
					except DoesNotExist:
						pass
				return media.serialize()
		raise SchemaValidationError
	except SchemaValidationError as e:
		raise SchemaValidationError().http_exception
	except DoesNotExist:
		raise UnauthorizedError().http_exception
	except MediaProcessingError:
		raise MediaProcessingError().http_exception
	except Exception as e:
		raise e

@router.post('/folder')
async def create_folder(folder_body: FolderForm, identity: str = Depends(get_jwt_identity)):
	try:
		if folder_body.folder == '..':
			raise SchemaValidationError
		User.objects.get(id=identity) # Check the user exists
		splitFolder = folder_body.folder.rsplit('/', 1)
		if len(splitFolder) == 2:
			base = splitFolder[0]
			folder = splitFolder[1]
		else:
			base = ''
			folder = folder_body.folder
		media = Media(owner=identity, folder=base, filename=folder, dir=True).save()
		return media.serialize()
	except NotUniqueError:
		raise AlreadyExistsError().http_exception
	except DoesNotExist:
		raise UnauthorizedError().http_exception
	except Exception as e:
		raise e

@router.get('/media')
async def get_media(folder: Optional[str] = '', ids: Optional[str] = None, private: Optional[bool] = False, sort: Optional[str] = 'filename', identity: str = Depends(get_jwt_identity)):
	try:
		out = []
		if ids:
			for id in ids.split(','):
				try:
					out.append(Media.objects.get(id=id))
				except DoesNotExist:
					pass
		else:
			if (len(folder) > 0 and folder[0] == '/') or sort not in ['filename', 'folder', 'size', '-filename', '-folder', '-size']:
				raise SchemaValidationError
			User.objects.get(id=identity)
			out = Media.objects(folder=folder, private=private).order_by(sort)
		return list(map(lambda m: m.serialize(), out))
	except SchemaValidationError:
		raise SchemaValidationError().http_exception
	except DoesNotExist:
		raise UnauthorizedError().http_exception
	except Exception as e:
		raise e

@router.delete('/media')
async def delete_media(folder: str, filename: Optional[str] = None, identity: str = Depends(get_jwt_identity)):
	try:
		media = Media.objects.get(owner=identity, folder=folder, filename=filename)
		for subMedia in media.associatedMedia:
			subMedia = subMedia.fetch()
			if subMedia.private:
				subMedia.delete()
		media.delete()
	except DoesNotExist:
		raise NotFoundError().http_exception
	except Exception as e:
		raise e

@router.post('/media/{id}/metadata')
async def set_metadata(id: str, metadata_body: MetadataForm, identity: str = Depends(get_jwt_identity)):
	try:
		Media.objects.get(id=id, owner=identity).update(metadata=metadata_body.metadata)
		return True
	except DoesNotExist:
		raise NotFoundError().http_exception
	except Exception as e:
		raise e

@router.get('/stream')
def stream(filename: Optional[str] = '', folder: Optional[str] = '', id: Optional[str] = None, range: Optional[str] = Header(None)):
	try:
		def iterfile(file, chunk_size, start, size):
			with BytesIO(file) as file_obj:
				bytes_read = 0
				file_obj.seek(start)
				while bytes_read < size:
					bytes_to_read = min(chunk_size, size - bytes_read)
					yield file_obj.read(bytes_to_read)
					bytes_read += bytes_to_read
				file_obj.close()
		asked = range or 'bytes=0-'
		if id:
			media = Media.objects.get(id=id)
		else:
			media = Media.objects.get(folder=folder, filename=filename)
		start_byte = int(asked.split('=')[-1].split('-')[0])
		chunk_size = FileSettings.MAX_STREAM_CHUNK_SIZE
		size = media.file.length
		if start_byte + chunk_size  > size:
			chunk_size = size - 1 - start_byte
		return StreamingResponse(
			content=iterfile(
				media.file.read(),
				chunk_size,
				start_byte,
				size
			),
			status_code=206,
			headers={
				'Accept-Ranges': 'bytes',
        		'Content-Range': f'bytes {start_byte}-{start_byte+chunk_size}/{size - 1}',
        		'Content-Type': media.file.content_type,
				'Content-Disposition': f'inline; filename="{media.filename.rsplit(".", 1)[0]}"'
			},
			media_type=media.file.content_type
		)
	except DoesNotExist:
		raise NotFoundError().http_exception
	except SchemaValidationError:
		raise SchemaValidationError().http_exception
	except Exception as e:
		raise e