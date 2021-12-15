from fastapi import APIRouter
from config import APISettings

from fastapi import Depends, UploadFile, File
from typing import Optional
from pydantic import BaseModel
from modules.JWT import get_jwt_identity

from resources.errors import NotFoundError, SchemaValidationError

from PIL import Image
from fractions import Fraction

import shutil
from pathlib import Path
from os import path, makedirs, scandir, remove
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

class UploadForm(BaseModel):
	file: UploadFile = File(...)
	folder: str
	ratio: Optional[str] = None

##########
# ROUTES #
##########

@router.post('/upload')
async def upload_file(upload_body: UploadForm, identity: str = Depends(get_jwt_identity)):
	try:
		if upload_body.file.filename == '':
			raise SchemaValidationError
		if allowed_file(upload_body.file.filename):
			requestedPath = path.join(UploadSettings.UPLOAD_FOLDER, identity, upload_body.folder)
			if not path.isdir(requestedPath):
				makedirs(requestedPath)
			# Handle filename collisions
			savePath = path.join(requestedPath, upload_body.file.filename)
			if path.isfile(savePath):
				counter = 2
				pathSplit = savePath.rsplit('.', 1)
				newPath = pathSplit[0] + '_' + str(counter) + '.' + pathSplit[1]
				while path.isfile(newPath):
					counter += 1
					newPath = pathSplit[0] + '_' + str(counter) + '.' + pathSplit[1]
				savePath = newPath
			
			if is_image(upload_body.file.filename):
				if upload_body.ratio:
					ratio = upload_body.ratio
				else:
					ratio = UploadSettings.DEFAULT_IMAGE_RATIO
				image = Image.open(upload_body.file.file)
				size = image.size
				width = size[0]
				height = size[1]
				quality = UploadSettings.IMAGE_COMPRESSION_AMOUNT
				ratio = fraction_to_float(ratio)
				if ratio != width / height:
					image_to_new_height(image, 1).save(savePath, optimize=True, quality=quality)
				else:
					image.save(savePath, optimize=True, quality=quality)
			else:
				with Path(savePath).open('wb') as dirBuf:
					shutil.copyfileobj(upload_body.file.file, dirBuf)
		return '/assets/uploads/' + identity + '/' + savePath.rsplit('/', 1)[1]
	except SchemaValidationError:
		raise SchemaValidationError().http_exception
	except Exception as e:
		raise e

@router.get('/media')
async def get_media(page: Optional[int] = None, size: Optional[int] = None, identity: str = Depends(get_jwt_identity)):
	try:
		mediaPath = path.join(UploadSettings.UPLOAD_FOLDER, identity)
		if path.isdir(mediaPath):
			filenames = []
			with scandir(mediaPath) as it:
				for entry in it:
					if entry.is_file():
						filenames.append(entry.name)
			def mapImageFilenames(file):
				if is_image(file):
					image = Image.open(path.join(mediaPath, file))
					return {
						'path': '/assets/uploads/' + identity + '/' + file,
						'ratio': str(Fraction(image.size[0], image.size[1]))
					}
				else:
					return {
						'path': '/assets/uploads/' + identity + '/' + file,
						'ratio': None
					}
			if page == None:
				page = 0
				size = len(filenames)
			elif size == None:
				raise SchemaValidationError
			return list(map(mapImageFilenames, filenames[page * size : page * size + size]))
		return { 'count': 0, 'files': [] }
	except SchemaValidationError:
		raise SchemaValidationError().http_exception
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