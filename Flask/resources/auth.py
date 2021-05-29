'''
Auth routes
'''

from flask import jsonify, request, render_template
from flask_restful_swagger_2 import Resource, swagger
from flask_jwt_extended import create_access_token, create_refresh_token, decode_token, jwt_required, get_jwt_identity
import datetime

from mongoengine.errors import FieldDoesNotExist, NotUniqueError, DoesNotExist
from jwt.exceptions import ExpiredSignatureError, DecodeError, InvalidTokenError
from resources.errors import SchemaValidationError, EmailAlreadyExistsError, UnauthorizedError, InternalServerError, EmailDoesnotExistsError, BadTokenError

from database.models import User
from services.mail_service import send_email


class SignupApi(Resource):
	@swagger.doc({
		'tags': ['Auth'],
		'description': 'Attempt to sign up',
		'parameters': [
			{
				'name': 'User',
				'description': 'The user object (email and password required)',
				'in': 'body',
				'type': 'object',
				'schema': None,
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'Signed up'
			}
		}
	})
	def post(self):
		try:
			body = request.get_json()
			user =  User(**body)
			if len(User.objects) == 0:
				user.admin = True
			user.hash_password()
			user.save()
			id = user.id
			return {'id': str(id)}, 200
		except FieldDoesNotExist:
			raise SchemaValidationError
		except NotUniqueError:
			raise EmailAlreadyExistsError
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			raise InternalServerError

class LoginApi(Resource):
	@swagger.doc({
		'tags': ['Auth'],
		'description': 'Log in',
		'parameters': [
			{
				'name': 'email',
				'description': 'The email',
				'in': 'body',
				'type': 'string',
				'schema': {
					'type': 'string'
				},
				'required': True
			},
			{
				'name': 'password',
				'description': 'The password',
				'in': 'body',
				'type': 'string',
				'schema': {
					'type': 'string'
				},
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'The access and refresh tokens',
			}
		}
	})
	def post(self):
		try:
			body = request.get_json()
			user = User.objects.get(email=body.get('email'))
			authorized = user.check_password(body.get('password'))
			if not authorized:
				raise UnauthorizedError

			expires = datetime.timedelta(days=7)
			access_token = create_access_token(identity=str(user.id), expires_delta=datetime.timedelta(hours=1))
			refresh_token = create_refresh_token(identity=str(user.id), expires_delta=datetime.timedelta(days=30))
			return {'accessToken': access_token, 'refreshToken': refresh_token}, 200
		except (UnauthorizedError, DoesNotExist):
			raise UnauthorizedError
		except Exception as e:
			raise InternalServerError

class TokenRefresh(Resource):
	@swagger.doc({
		'tags': ['Auth'],
		'description': 'Refresh tokens',
		'responses': {
			'200': {
				'description': 'A new access token'
			}
		}
	})
	@jwt_required(refresh=True)
	def get(self):
		expires = datetime.timedelta(days=7)
		access_token = create_access_token(identity=get_jwt_identity(), expires_delta=expires)
		refresh_token = create_refresh_token(identity=get_jwt_identity(), expires_delta=datetime.timedelta(days=30))
		return {'accessToken': access_token, 'refreshToken': refresh_token}, 200

class CheckPassword(Resource):
	@swagger.doc({
		'tags': ['Auth'],
		'description': 'Check the password against the token',
		'responses': {
			'200': {
				'description': 'Password is correct'
			}
		}
	})
	@jwt_required()
	def post(self):
		try:
			body = request.get_json()
			user = User.objects.get(id=get_jwt_identity())
			authorized = user.check_password(body.get('password'))
			if not authorized:
				raise UnauthorizedError
			return 'ok', 200
		except (UnauthorizedError, AttributeError):
			raise UnauthorizedError
		except Exception:
			raise InternalServerError

class TwoFactorApi(Resource):
	@swagger.doc({
		'tags': ['Auth', '2FA'],
		'description': 'Get the TOTP URI for this user',
		'responses': {
			'200': {
				'description': 'The TOTP URI'
			}
		}
	})
	@jwt_required()
	def get(self):
		try:
			user = User.objects.get(id=get_jwt_identity())
			return user.get_totp_uri()			
		except Exception:
			raise InternalServerError
	@swagger.doc({
		'tags': ['Auth', '2FA'],
		'description': 'Verify an OTP',
		'responses': {
			'200': {
				'description': 'Accepted'
			}
		}
	})
	@jwt_required()
	def post(self):
		try:
			body = request.get_json()
			user = User.objects.get(id=get_jwt_identity())
			if user.verify_totp(body.get('otp')):
				return 'ok'
			raise UnauthorizedError
		except Exception:
			raise InternalServerError
	

class ForgotPassword(Resource):
	@swagger.doc({
		'tags': ['Auth'],
		'description': 'Send a forgot password email',
		'parameters': [
			{
				'name': 'email',
				'description': 'The user\'s email',
				'in': 'body',
				'type': 'string',
				'schema': {
					'type': 'string'
				},
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'Email sent'
			}
		}
	})
	def post(self):
		url = request.host_url + 'reset/'
		try:
			body = request.get_json()
			email = body.get('email')
			if not email:
				raise SchemaValidationError

			user = User.objects.get(email=email)
			if not user:
				raise EmailDoesnotExistsError

			expires = datetime.timedelta(hours=24)
			reset_token = create_access_token(str(user.id), expires_delta=expires)

			return send_email('[Flask Api] Reset Your Password',
							  sender='support@movie-bag.com',
							  recipients=[user.email],
							  text_body=render_template('email/reset_password.txt',
														url=url + reset_token),
							  html_body=render_template('email/reset_password.html',
														url=url + reset_token))
		except SchemaValidationError:
			raise SchemaValidationError
		except EmailDoesnotExistsError:
			raise EmailDoesnotExistsError
		except Exception as e:
			raise InternalServerError

class ResetPassword(Resource):
	@swagger.doc({
		'tags': ['Auth'],
		'description': 'Reset a user\'s password',
		'responses': {
			'200': {
				'description': 'Password reset'
			}
		}
	})
	def post(self):
		url = request.host_url + 'reset/'
		try:
			body = request.get_json()
			reset_token = body.get('reset_token')
			password = body.get('password')

			if not reset_token or not password:
				raise SchemaValidationError

			user_id = decode_token(reset_token)['identity']

			user = User.objects.get(id=user_id)

			user.modify(password=password)
			user.hash_password()
			user.save()

			return send_email('[Movie-bag] Password reset successful',
							  sender='support@movie-bag.com',
							  recipients=[user.email],
							  text_body='Password reset was successful',
							  html_body='<p>Password reset was successful</p>')

		except SchemaValidationError:
			raise SchemaValidationError
		except ExpiredSignatureError:
			raise ExpiredTokenError
		except (DecodeError, InvalidTokenError):
			raise BadTokenError
		except Exception as e:
			raise InternalServerError

class UserApi(Resource):
	@swagger.doc({
		'tags': ['Auth', 'User'],
		'description': 'Get the current user',
		'responses': {
			'200': {
				'description': 'The current user'
			}
		}
	})
	@jwt_required()
	def get(self):
		try:
			user = User.objects.get(id=get_jwt_identity())
			return jsonify(user.serialize())
		except Exception:
			raise InternalServerError
	@swagger.doc({
		'tags': ['Auth', 'User'],
		'description': 'Update the current user',
		'responses': {
			'200': {
				'description': 'Current user updated.'
			}
		}
	})
	@jwt_required()
	def put(self):
		try:
			body = request.get_json()
			user = User.objects.get(id=get_jwt_identity())
			user.update(**body)
			if body.get('password'):
				user.hash_password()
			return 'ok', 200
		except Exception:
			raise InternalServerError
	@swagger.doc({
		'tags': ['Auth', 'User'],
		'description': 'Delete the current user',
		'responses': {
			'200': {
				'description': 'User deleted'
			}
		}
	})
	@jwt_required()
	def delete(self):
		try:
			User.objects.get(id=get_jwt_identity()).delete()
			return 'ok', 200
		except Exception:
			raise InternalServerError