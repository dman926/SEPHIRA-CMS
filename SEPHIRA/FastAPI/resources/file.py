from fastapi import APIRouter
from mongoengine.errors import DoesNotExist
from config import APISettings

from fastapi import Depends, UploadFile, File, Form
from typing import Optional
from pydantic import BaseModel
from modules.JWT import get_jwt_identity

from resources.errors import NotFoundError, SchemaValidationError, UnauthorizedError
from database.models import User

from PIL import Image
from fractions import Fraction

import shutil
from pathlib import Path
from os import path, makedirs, scandir, remove, stat
from config import UploadSettings

router = APIRouter(
	prefix=APISettings.ROUTE_BASE + 'file',
	tags=['File']
)

###########
# HELPERS #
###########

def allowed_file(filename: str) -> bool:
	return '.' in filename and filename.rsplit('.', 1)[1].lower() in UploadSettings.ALLOWED_EXTENSIONS

def allowed_image_ratio(ratio: str) -> bool:
	return ratio in UploadSettings.ALLOWED_IMAGE_RATIOS

def is_image(filename: str) -> bool:
	return '.' in filename and filename.rsplit('.', 1)[1].lower() in UploadSettings.IMAGE_EXTENSIONS

def image_to_new_height(image: Image, requestedHeight: float) -> Image:
	width = image.size[0]
	height = image.size[1]
	heightMult = 1 / (requestedHeight / (width / height))
	newHeight = int(height * heightMult)
	background = Image.new('RGB', (width, newHeight), (0, 0, 0))
	offset = (0, int(round(((newHeight - height) / 2), 0)))
	background.paste(image, offset)
	return background

def fraction_to_float(fraction: str) -> float:
	''' Expects a non-mixed fraction (ex. `16/9`) '''
	try:
		return float(fraction)
	except ValueError:
		num, denom = fraction.split('/')
		return float(num) / float(denom)

###########
# SCHEMAS #
###########

class FolderForm(BaseModel):
	folder: str

##########
# ROUTES #
##########

@router.post('/upload')
async def upload_file(file: UploadFile = File(...), folder: Optional[str] = Form(''), ratio: Optional[str] = Form(None), identity: str = Depends(get_jwt_identity)):
	try:
		if file.filename == '' or (len(folder) > 0 and folder[0] == '/'):
			raise SchemaValidationError
		User.objects.get(id=identity) # make sure the user exists
		if allowed_file(file.filename):
			out = { }
			requestedPath = path.join(UploadSettings.UPLOAD_FOLDER, identity, folder)
			if not path.isdir(requestedPath):
				makedirs(requestedPath)
			# Handle filename collisions
			savePath = path.join(requestedPath, file.filename)
			if path.isfile(savePath):
				counter = 2
				pathSplit = savePath.rsplit('.', 1)
				newPath = pathSplit[0] + '_' + str(counter) + '.' + pathSplit[1]
				while path.isfile(newPath):
					counter += 1
					newPath = pathSplit[0] + '_' + str(counter) + '.' + pathSplit[1]
				savePath = newPath
			
			if is_image(file.filename):
				if ratio:
					ratio = ratio
				else:
					ratio = UploadSettings.DEFAULT_IMAGE_RATIO
				out['ratio'] = ratio
				image = Image.open(file.file)
				size = image.size
				width = size[0]
				height = size[1]
				quality = UploadSettings.IMAGE_COMPRESSION_AMOUNT
				ratio = fraction_to_float(ratio)
				if ratio != width / height:
					image_to_new_height(image, ratio).save(savePath, optimize=True, quality=quality)
				else:
					image.save(savePath, optimize=True, quality=quality)
			else:
				with Path(savePath).open('wb') as dirBuf:
					shutil.copyfileobj(file.file, dirBuf)
			size = stat(savePath).st_size
		else:
			raise SchemaValidationError
		out['path'] = '/assets/uploads/' + identity + '/' + savePath.rsplit('/', 1)[1],
		out['size'] = size
		return out
	except SchemaValidationError:
		raise SchemaValidationError().http_exception
	except DoesNotExist:
		raise UnauthorizedError().http_exception
	except Exception as e:
		raise e


@router.post('/folder')
async def create_folder(folder_body: FolderForm, identity: str = Depends(get_jwt_identity)):
	try:
		User.objects.get(id=identity)
		if len(folder_body.folder) > 0 and folder_body.folder[0] == '/':
			raise SchemaValidationError
		requestedPath = path.join(UploadSettings.UPLOAD_FOLDER, identity, folder_body.folder)
		if not path.isdir(requestedPath):
			makedirs(requestedPath)
			return True
		return False
	except SchemaValidationError:
		raise SchemaValidationError().http_exception
	except DoesNotExist:
		raise UnauthorizedError().http_exception
	except Exception as e:
		raise e

@router.get('/media')
async def get_media(folder: Optional[str] = '', page: Optional[int] = None, size: Optional[int] = None, identity: str = Depends(get_jwt_identity)):
	try:
		if len(folder) > 0 and folder[0] == '/':
			raise SchemaValidationError
		User.objects.get(id=identity)
		mediaPath = path.join(UploadSettings.UPLOAD_FOLDER, identity, folder)
		if path.isdir(mediaPath):
			filenames = []
			with scandir(mediaPath) as it:
				for entry in it:
					filenames.append(entry.name)
			def mapFilenames(file):
				out = {
					'path': '/assets/uploads/' + identity + folder + '/' + file
				}
				if is_image(file):
					image = Image.open(path.join(mediaPath, file))
					out['ratio'] = str(Fraction(image.size[0], image.size[1]))
				absPath = path.join(mediaPath, file)
				out['size'] = stat(absPath).st_size
				isDir = path.isdir(absPath)
				if isDir:
					out['dir'] = True
				return out
			if page == None:
				page = 0
				size = len(filenames)
			elif size == None:
				raise SchemaValidationError
			return list(map(mapFilenames, filenames[page * size : page * size + size]))
		return { 'count': 0, 'files': [] }
	except SchemaValidationError:
		raise SchemaValidationError().http_exception
	except DoesNotExist:
		raise UnauthorizedError().http_exception
	except Exception as e:
		raise e

@router.delete('/media/{filename}')
async def delete_media(filename: str, identity: str = Depends(get_jwt_identity)):
	try:
		mediaFolderPath = path.join(UploadSettings.UPLOAD_FOLDER, identity)
		mediaPath = path.join(mediaFolderPath, filename)
		if path.isdir(mediaFolderPath) and path.isfile(mediaPath):
			remove(mediaPath)
			return 'ok'
		raise NotFoundError
	except NotFoundError:
		raise NotFoundError().http_exception
	except Exception as e:
		raise e