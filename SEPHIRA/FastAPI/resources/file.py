from fastapi import APIRouter
from starlette.responses import StreamingResponse
from config import APISettings

from fastapi import Depends, UploadFile, File, Form, Header
from typing import Optional
from pydantic import BaseModel
from modules.JWT import get_jwt_identity

from mongoengine.errors import DoesNotExist, NotUniqueError
from resources.errors import NotFoundError, SchemaValidationError, UnauthorizedError, AlreadyExistsError
from database.models import User, Media

from config import FileSettings

import mimetypes
from io import BytesIO

router = APIRouter(
	prefix=APISettings.ROUTE_BASE + 'file',
	tags=['File']
)

###########
# HELPERS #
###########

def allowed_file(filename: str) -> bool:
	return '.' in filename and filename.rsplit('.', 1)[1].lower() in FileSettings.ALLOWED_EXTENSIONS

###########
# SCHEMAS #
###########

class FolderForm(BaseModel):
	folder: str

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
			media = Media(owner=identity, filename=filename, folder=folder)
			mimetype = file.content_type
			if not mimetype:
				mimetype = mimetypes.MimeTypes().guess_type(file.filename)
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
	except SchemaValidationError:
		raise SchemaValidationError().http_exception
	except DoesNotExist:
		raise UnauthorizedError().http_exception
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
async def get_media(folder: Optional[str] = '', ids: Optional[str] = None, sort: Optional[str] = 'filename', identity: str = Depends(get_jwt_identity)):
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
			out = Media.objects(folder=folder).order_by(sort)
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