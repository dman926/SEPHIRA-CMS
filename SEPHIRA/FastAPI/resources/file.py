from fastapi import APIRouter
from starlette.responses import StreamingResponse
from config import APISettings

from fastapi import Depends, UploadFile, File, Form
from typing import Optional
from pydantic import BaseModel
from modules.JWT import get_jwt_identity

from mongoengine.errors import DoesNotExist, NotUniqueError
from resources.errors import NotFoundError, SchemaValidationError, UnauthorizedError, AlreadyExistsError
from database.models import User, Media

from config import UploadSettings

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
	return '.' in filename and filename.rsplit('.', 1)[1].lower() in UploadSettings.ALLOWED_EXTENSIONS

###########
# SCHEMAS #
###########

class FolderForm(BaseModel):
	folder: str

##########
# ROUTES #
##########

@router.post('/upload')
async def upload_file(file: UploadFile = File(...), folder: Optional[str] = Form(''), identity: str = Depends(get_jwt_identity)):
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
			media = Media(owner=identity, filename=filename, folder=folder, size=len(file.file.read()))
			file.file.seek(0)
			media.file.put(file.file, content_type=mimetypes.MimeTypes().guess_type(file.filename)[0])
			media.save()
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
async def get_media(folder: Optional[str] = '', identity: str = Depends(get_jwt_identity)):
	try:
		if len(folder) > 0 and folder[0] == '/':
			raise SchemaValidationError
		User.objects.get(id=identity)
		return list(map(lambda m: m.serialize(), Media.objects(folder=folder)))
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
def stream(filename: str, folder: Optional[str] = ''):
	try:
		def iterfile(file):
			with BytesIO(file) as file_obj:
				yield from file_obj
		media = Media.objects.get(folder=folder, filename=filename)
		print(media.file.content_type)
		return StreamingResponse(iterfile(media.file.read()), media_type=media.file.content_type)
	except DoesNotExist:
		raise NotFoundError().http_exception
	except Exception as e:
		raise e