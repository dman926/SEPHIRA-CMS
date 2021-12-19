from fastapi import APIRouter
from starlette.responses import StreamingResponse
from config import APISettings

from fastapi import Depends, UploadFile, File, Form, Header
from typing import Optional, Union, IO
from tempfile import SpooledTemporaryFile
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
	return '.' in filename and filename.rsplit('.', 1)[1].lower() in FileSettings.ALLOWED_EXTENSIONS

# ffmpeg/ffprobe functions

def probe(format: str, file: bytes) -> dict:
	args = ["ffprobe", "-show_streams", "-of", "json", "-v", "quiet", '-f', format, "pipe:0"]
	p = Popen(args, stdin=PIPE, stdout=PIPE, stderr=PIPE)
	out, err = p.communicate(input=file)
	if err:
		raise SubprocessError
	try:
		return loads(out)
	except Exception as e:
		raise e

def createFaststartFile(format: str, file: Union[SpooledTemporaryFile[bytes], IO]) -> bytes:
	# Have to save the file to disk to allow ffmpeg to seek
	filename = f'{str(uuid4())}.{format}'
	filename2 = f'{str(uuid4())}.{format}'
	if not path.isdir('media_processing'):
		mkdir('media_processing')
	with open(f'media_processing/{filename}', 'wb+') as file_obj:
		file_obj.write(file.read())
		args = ['ffmpeg', '-i', f'media_processing/{filename}', '-c', 'copy', '-movflags', '+faststart', '-v', 'quiet', f'media_processing/{filename2}']
		p = Popen(args)
		if p.wait() != 0:
			raise MediaProcessingError
		with open(f'media_processing/{filename2}', 'rb') as out_file_obj:
			out_file = out_file_obj.read()
			remove(f'media_processing/{filename}')
			remove(f'media_processing/{filename2}')
			if len(listdir('media_processing')) == 0:
				rmdir('media_processing')
			return out_file

def extractVideo(format: str, file: bytes, stream_index: int, codec_name: str) -> bytes:
	if codec_name == 'h.264':
		pass
	args = ['ffmpeg', '-f', format, '-i', 'pipe:0', '-map', '0:' + str(stream_index), '-v', 'quiet', '-f', 'webm', 'pipe:1']
	p = Popen(args, stdin=PIPE, stdout=PIPE)
	out = p.communicate(input=file)[0]
	if p.wait() != 0:
		raise SubprocessError
	return out

def processAudio(format: str, file: bytes, stream_index: int, owner: str, filename: str, folder: str) -> str:
	args = ['ffmpeg', '-f', format, '-i', 'pipe:0', '-map', '0:' + str(stream_index), '-v', 'quiet', '-f', 'opus', 'pipe:1']
	p = Popen(args, stdin=PIPE, stdout=PIPE)
	out = p.communicate(input=file)[0]
	if p.wait() != 0:
		raise SubprocessError
	try:
		with BytesIO(out) as file_obj:
			media = Media(owner=owner, filename=filename.rsplit('.', 1)[0] + '.opus', folder=folder, private=True)
			media.file.put(file_obj, content_type='audio/opus')
			media.save()
			return str(media.id)
	except Exception as e:
		raise e

def processSubtitles(format: str, file: bytes, stream_index: int, owner: str, filename: str, folder: str) -> str:
	args = ['ffmpeg', '-f', format, '-i', 'pipe:0', '-map', '0:' + str(stream_index), '-f', 'vtt', 'pipe:1']
	p = Popen(args, stdin=PIPE, stdout=PIPE)
	out = p.communicate(input=file)
	if p.wait() != 0:
		raise SubprocessError
	try:
		with BytesIO(out) as file_obj:
			media = Media(owner=owner, filename=filename.rsplit('.', 1)[0] + '.vtt', folder=folder, private=True)
			media.file.put(file_obj, content_type='text/vtt')
			media.save()
			return str(media.id)
	except Exception as e:
		raise e

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
async def upload_file(file: UploadFile = File(...), folder: Optional[str] = Form(''), childOf: Optional[str] = Form(''), identity: str = Depends(get_jwt_identity)):
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
			
			media = None

			if FileSettings.ENABLE_FFMPEG and FileSettings.ENABLE_FILE_PROCESSING and mimetype[:5] == 'video':
				# Process the file
				file_format = filename.rsplit('.', 1)[1]
				file_bytes = createFaststartFile(file_format, file.file)
				try:
					streams = probe(file_format, file_bytes)['streams']
				except Exception:
					raise MediaProcessingError
				for stream in streams:
					if 'codec_type' in stream:
						if stream['codec_type'] == 'video' and 'index' in stream:
							media = Media(owner=identity, filename=filename.rsplit('.', 1)[0] + '.webm', folder=folder, processing=True)
							with BytesIO(extractVideo(file_format, file_bytes, stream['index'], stream['codec_name'])) as file_obj:
								media.file.put(file_obj, content_type=mimetype)
							media.save()
							break # Only allow the first video stream

				if media:
					for stream in streams:
						if 'codec_type' in stream and 'index' in stream:
							if stream['codec_type'] == 'audio':
								media.update(push__associatedMedia=processAudio(file_format, file_bytes, stream['index'], identity, filename, folder))
							elif stream['codec_type'] == 'subtitle':
								media.update(push__associatedMedia=processSubtitles(file_format, file_bytes, stream['index'], identity, filename, folder))
			else:
				media = Media(owner=identity, filename=filename, folder=folder)
				media.file.put(file.file, content_type=mimetype)
				media.save()

			if not media:
				raise MediaProcessingError

			for parent in childOf.split(','):
				try:
					if parent:
						Media.objects.get(id=parent).update(push__associatedMedia=media)
				except DoesNotExist:
					pass
			return media.serialize()
		raise SchemaValidationError
	except SchemaValidationError:
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
		Media.objects.get(owner=identity, folder=folder, filename=filename).delete()
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