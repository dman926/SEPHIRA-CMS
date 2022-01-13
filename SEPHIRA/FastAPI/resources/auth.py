from fastapi import APIRouter
from config import APISettings

from fastapi import Depends, Request, BackgroundTasks
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import Optional
from mongoengine.errors import NotUniqueError, DoesNotExist, ValidationError

from modules.JWT import Token, create_access_token, create_refresh_token, get_jwt_identity, get_raw_token
from database.models import User, UserModel
from resources.errors import NotFoundError, NotVerifiedError, UserAlreadyExistsError, UnauthorizedError, MissingOtpError
from services.mail_service import send_email_backround
from services.util_service import base_model_to_clean_dict

from datetime import datetime, timedelta
from time import sleep
import base64
import os

router = APIRouter(
	prefix=APISettings.ROUTE_BASE + 'auth',
	tags=['Auth']
)

###########
# SCHEMAS #
###########

class EmailPasswordForm(BaseModel):
	username: EmailStr
	password: str
	client_secret: Optional[str] = None
	client_id: Optional[str] = None

class PasswordForm(BaseModel):
	password: str

class OtpForm(BaseModel):
	otp: str

class EmailForm(BaseModel):
	email: str

##########
# ROUTES #
##########

@router.post('/signup')
async def signup(form_data: EmailPasswordForm, request: Request, background_tasks: BackgroundTasks):
	try:
		try:
			user = User(email=form_data.username, password=form_data.password)
		except NotUniqueError:
			user = User.objects.get(email=form_data.username, verified=False, created__lt=datetime.now() - timedelta(days=1))
			user.password = form_data.password
		if User.objects.count() == 0:
			user.admin = True
		user.hash_password()
		user.save()
		verify_token = create_access_token(str(user.id), expires_delta=timedelta(days=1))
		send_email_backround(
			background_tasks,
			'Verify Your Email',
			[user.email],
			'verify_email.html',
			{
				'url': f'{request.client.host}:{request.client.port}/login?t={verify_token}',
			}
		)
		# FOR DEBUG PURPOSES
		# TODO: remove in production
		print(request.client.host + ':' + request.client.port + '/login?t=' + verify_token)
		return { 'id': str(user.id) }
	except DoesNotExist:
		raise UserAlreadyExistsError().http_exception
	except Exception as e:
		raise e

@router.post('/verify')
async def verify_email(identity: str = Depends(get_jwt_identity)):
	try:
		user = User.objects.get(id=identity)
		user.verified = True
		user.save()
		return 'ok'
	except DoesNotExist:
		raise UnauthorizedError().http_exception
	except Exception as e:
		raise e

@router.post('/resend-verify')
async def resend_verify_email(form_body: EmailForm, request: Request, background_tasks: BackgroundTasks):
	try:
		user = User.objects.get(email=form_body.email)
		if user.verified:
			raise UnauthorizedError
		verify_token = create_access_token(str(user.id), expires_delta=timedelta(days=1))
		send_email_backround(
			background_tasks,
			'Verify Your Email',
			[user.email],
			'verify_email.html',
			{
				'url': f'{request.client.host}:{request.client.port}/login?t={verify_token}',
			}
		)
		return 'ok'
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError().http_exception
	except Exception as e:
		raise e

@router.post('/login')
async def login(form_data: EmailPasswordForm):
	try:
		user = None
		if form_data.client_secret:
			user = User.objects.get(email=get_jwt_identity(form_data.client_secret))
		else:
			user = User.objects.get(email=form_data.username)
			if not user.check_password(form_data.password):
				raise UnauthorizedError
			if user.twoFactorEnabled:
				otp = form_data.client_id
				if not otp:
					raise MissingOtpError
				if not user.verify_totp(otp):
					raise UnauthorizedError
		if not user.verified:
			raise NotVerifiedError
		return {
			'access_token': create_access_token(identity=str(user.id)),
			'refresh_token': create_refresh_token(identity=str(user.id))
		}
	except (UnauthorizedError, DoesNotExist):
		sleep(2)
		raise UnauthorizedError(detail='Incorrect email, password, or otp').http_exception
	except MissingOtpError:
		raise MissingOtpError().http_exception
	except NotVerifiedError:
		raise NotVerifiedError().http_exception
	except Exception as e:
		raise e

# needed a separate login for docs due to how it sends the login data
@router.post('/docs-login')
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
	try:
		if form_data.client_secret:
			user = User.objects.get(email=get_jwt_identity(form_data.client_secret))
		else:
			user = User.objects.get(email=form_data.username)
			if not user.check_password(form_data.password):
				raise UnauthorizedError
			if user.twoFactorEnabled:
				otp = form_data.client_id
				if not otp:
					raise MissingOtpError
				if not user.verify_totp(otp):
					raise UnauthorizedError
		if not user.verified:
			raise NotVerifiedError
		return {
			'access_token': create_access_token(identity=str(user.id)),
			'refresh_token': create_refresh_token(identity=str(user.id))
		}
	except (UnauthorizedError, DoesNotExist):
		sleep(2)
		raise UnauthorizedError(detail='Incorrect email, password, or otp').http_exception
	except MissingOtpError:
		raise MissingOtpError().http_exception
	except NotVerifiedError:
		raise NotVerifiedError().http_exception
	except Exception as e:
		raise e

@router.post('/refresh')
async def token_refresh2(token: Token = Depends(get_raw_token)):
	try:
		if 'refresh' not in token or not token['refresh']:
			raise UnauthorizedError
		identity = token['sub']
		User.objects.get(id=identity) # Verify the user exists
		return {
			'access_token': create_access_token(identity=identity),
			'refresh_token': create_refresh_token(identity=identity)
		}
	except UnauthorizedError:
		raise UnauthorizedError(detail='Invalid token. Not a refresh token').http_exception
	except DoesNotExist:
		raise UnauthorizedError(detail='Invalid token').http_exception
	except Exception as e:
		raise e

@router.get('/check-password')
async def check_password(password_body: PasswordForm, identity: str = Depends(get_jwt_identity)):
	try:
		user = User.objects.get(id=identity)
		authorized = user.check_password(password_body.password)
		if not authorized:
			raise UnauthorizedError
		return 'ok'
	except (UnauthorizedError, DoesNotExist):
		raise UnauthorizedError().http_exception
	except Exception as e:
		raise e

@router.get('/2fa')
async def get_otp_code(identity: str = Depends(get_jwt_identity)):
	try:
		user = User.objects.get(id=identity)
		user.otpSecret = base64.b32encode(os.urandom(10)).decode('utf8')
		user.save()
		return user.get_totp_uri()
	except DoesNotExist:
		raise UnauthorizedError().http_exception
	except Exception as e:
		raise e

@router.post('/2fa')
async def verify_otp_code(otp_body: OtpForm, identity: str = Depends(get_jwt_identity)):
	try:
		user = User.objects.get(id=identity)
		if user.verify_totp(otp_body.otp):
			return True
		raise UnauthorizedError
	except (UnauthorizedError, DoesNotExist):
		raise UnauthorizedError().http_exception
	except Exception as e:
		raise e

@router.post('/forgot')
async def forgot_password(email_body: EmailForm, request: Request, background_tasks: BackgroundTasks):
	try:
		user = User.objects.get(email=email_body.email)
		reset_token = create_access_token(str(user.id), expires_delta=timedelta(days=1))
		send_email_backround(
			background_tasks,
			'Reset Your Password',
			[email_body.email],
			'reset_password.html',
			{
				'url': f'{request.client.host}:{request.client.port}/login/reset?t={reset_token}',
			}
		)
		return 'ok'
	except DoesNotExist:
		sleep(2)
		return 'ok'
	except Exception as e:
		raise e

@router.post('/reset')
async def reset_password(password_body: PasswordForm, background_tasks: BackgroundTasks, identity: str = Depends(get_jwt_identity)):
	try:
		user = User.objects.get(id=identity)
		user.modify(password=password_body.password)
		user.hash_password()
		user.save()
		send_email_backround(
			background_tasks,
			'Password Has Been Reset',
			[user.email],
			'password_reset.html'
		)
		if user.verified:
			return {
				'access_token': create_access_token(identity=str(user.id)),
				'refresh_token': create_refresh_token(identity=str(user.id))
			}
		return 'ok'
	except Exception as e:
		raise e

@router.get('/user')
async def get_user(identity: str = Depends(get_jwt_identity)):
	try:
		user = User.objects.get(id=identity)
		return user.serialize()
	except DoesNotExist:
		raise UnauthorizedError().http_exception
	except Exception as e:
		raise e

@router.put('/user')
async def update_user(user: UserModel, identity: str = Depends(get_jwt_identity)):
	try:
		foundUser = User.objects.get(id=identity)
		if user.admin:
			raise UnauthorizedError # Cannot set themselves as admin
		foundUser.update(**base_model_to_clean_dict(user))
		if user.password:
			user.hash_password()
			user.save()
		return True
	except (UnauthorizedError, DoesNotExist):
		raise UnauthorizedError().http_exception
	except Exception as e:
		raise e

@router.delete('/user')
async def delete_user(identity: str = Depends(get_jwt_identity)):
	try:
		# TODO: 'archive' the user instead of deleting
		User.objects.get(id=identity).delete()
		return True
	except DoesNotExist:
		raise UnauthorizedError().http_exception
	except Exception as e:
		raise e