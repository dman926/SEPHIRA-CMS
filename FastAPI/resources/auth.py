from fastapi import APIRouter
from config import API_SETTINGS

from fastapi import Depends, Form
from pydantic import BaseModel
from typing import Optional
from mongoengine.errors import NotUniqueError, DoesNotExist

from modules.JWT import Token, create_access_token, create_refresh_token, decode_token, get_jwt_identity
from database.models import User, UserModel
from resources.errors import UserAlreadyExistsError, UnauthorizedError, MissingOtpError

from time import sleep

router = APIRouter(
	prefix=API_SETTINGS.ROUTE_BASE + 'auth',
	tags=['auth']
)

###########
# SCHEMAS #
###########

class EmailPasswordForm(BaseModel):
	def __init__(self, email: str = Form(...), password: str = Form(...), otp: Optional[str] = Form(None)):
		self.email = email
		self.password = password
		self.otp = otp

##########
# ROUTES #
##########

@router.post('/signup')
async def signup(form_data: EmailPasswordForm = Depends()):
	try:
		user = User(email = form_data.email, password = form_data.password)
		if User.objects.count() == 0:
			user.admin = True
		user.hash_password()
		user.save()
		return {'id': str(user.id)}
	except NotUniqueError:
		raise UserAlreadyExistsError()
	except Exception as e:
		raise e

@router.post('/login')
async def login(form_data: EmailPasswordForm = Depends()):
	try:
		user = User.objects.get(email=form_data.email)
		if not user.check_password(form_data.password):
			raise UnauthorizedError
		if user.twoFactorEnabled:
			otp = form_data.otp
			if not otp:
				raise MissingOtpError
			if not user.verify_totp(otp):
				raise UnauthorizedError
		return {
			'accessToken': create_access_token(identity=str(user.id)),
			'refreshToken': create_refresh_token(identity=str(user.id))
		}
	except (UnauthorizedError, DoesNotExist):
		sleep(2)
		raise UnauthorizedError(detail='Incorrect email, password, or otp')
	except MissingOtpError:
		raise MissingOtpError()
	except Exception as e:
		raise e

@router.get('/refresh')
async def tokenRefresh(token: Token = Depends(decode_token)):
	try:
		if not token['refresh']:
			raise UnauthorizedError
		identity = token['sub']
		User.objects.get(id=identity)
		return {
			'accessToken': create_access_token(identity=identity),
			'refreshToken': create_refresh_token(identity=identity)
		}
	except UnauthorizedError:
		raise UnauthorizedError(detail='Invalid token. Not a refresh token')
	except DoesNotExist:
		raise UnauthorizedError(detail='Invalid token')
	except Exception as e:
		raise e

@router.get('/check-password')
async def checkPassword(password: str, identity: str = Depends(get_jwt_identity)):
	try:
		user = User.objects.get(id=identity)
		authorized = user.check_password(password)
		if not authorized:
			raise UnauthorizedError
		return 'ok'
	except (UnauthorizedError, DoesNotExist):
		raise UnauthorizedError()
	except Exception as e:
		raise e

@router.get('/2fa')
async def getOtpCode(identity: str = Depends(get_jwt_identity)):
	try:
		user = User.objects.get(id=identity)
		return user.get_totp_uri()
	except DoesNotExist:
		raise UnauthorizedError()
	except Exception as e:
		raise e

@router.post('/2fa')
async def verifyOtpCode(otp: str, identity: str = Depends(get_jwt_identity)):
	try:
		user = User.objects.get(id=identity)
		if user.verify_totp(otp):
			return 'ok'
		raise UnauthorizedError
	except (UnauthorizedError, DoesNotExist):
		raise UnauthorizedError()
	except Exception as e:
		raise e

@router.get('/user')
async def getUser(identity: str = Depends(get_jwt_identity)):
	try:
		user = User.objects.get(id=identity)
		return user.serialize()
	except DoesNotExist:
		raise UnauthorizedError()
	except Exception as e:
		raise e

@router.put('/user')
async def updateUser(user: UserModel, identity: str = Depends(get_jwt_identity)):
	try:
		user = User.objects.get(id=identity)
		user.update(**user)
		if user.password:
			user.hash_password()
			user.save()
		return 'ok'
	except DoesNotExist:
		raise UnauthorizedError()
	except Exception as e:
		raise e

@router.delete('/user')
async def deleteUser(identity: str = Depends(get_jwt_identity)):
	try:
		User.objects.get(id=identity).delete()
		return 'ok'
	except DoesNotExist:
		raise UnauthorizedError()
	except Exception as e:
		raise e