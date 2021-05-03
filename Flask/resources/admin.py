'''
Admin routes
'''

from flask import jsonify, request, render_template
from flask_restful_swagger_2 import Resource, swagger
from flask_jwt_extended import create_access_token, create_refresh_token, decode_token, jwt_required, get_jwt_identity
import datetime

from mongoengine.errors import FieldDoesNotExist, NotUniqueError, DoesNotExist
from jwt.exceptions import ExpiredSignatureError, DecodeError, InvalidTokenError
from resources.errors import SchemaValidationError, EmailAlreadyExistsError, UnauthorizedError, InternalServerError, EmailDoesnotExistsError, BadTokenError

from database.models import User

class AdminApi(Resource):
	'''
	Get if current user is admin
	'''
	@swagger.doc({
		'tags': ['Admin'],
		'description': 'Get if the current user is admin',
		'responses': {
			'200': {
				'description': 'True if the user is admin, false otherwise'
			}
		}
	})
	@jwt_required()
	def get(self):
		try:
			user = User.objects.get(id=get_jwt_identity())
			return user.admin
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception:
			raise InternalServerError

class AdminUsersApi(Resource):
	'''
	Get all users
	'''
	@swagger.doc({
		'tags': ['Admin'],
		'description': 'Get all users',
		'responses': {
			'200': {
				'description': 'An array of User'
			}
		}
	})
	@jwt_required()
	def get(self):
		try:
			user = User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			users = User.objects
			return jsonify(users)
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception:
			raise InternalServerError

class AdminUserApi(Resource):
	@swagger.doc({
		'tags': ['Admin', 'User'],
		'description': 'Get user',
		'parameters': [
			{
				'name': 'id',
				'description': 'The user id',
				'in': 'path',
				'type': 'object',
				'schema': None,
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'The user'
			}
		}
	})
	@jwt_required()
	def get(self, id):
		try:
			user = User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			user = User.objects.get(id=id)
			return jsonify(user)
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception:
			raise InternalServerError
	@swagger.doc({
		'tags': ['Admin', 'User'],
		'description': 'Update user',
		'parameters': [
			{
				'name': 'id',
				'description': 'The user id',
				'in': 'path',
				'type': 'object',
				'schema': None,
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'User updated'
			}
		}
	})
	@jwt_required()
	def put(self, id):
		try:
			user = User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			user = User.objects.get(id=request.params)
			user.update(**request.get_json())
			return 'ok'
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception:
			raise InternalServerError
	@swagger.doc({
		'tags': ['Admin', 'User'],
		'description': 'Delete user',
		'parameters': [
			{
				'name': 'id',
				'description': 'The user id',
				'in': 'path',
				'type': 'object',
				'schema': None,
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'User deleted'
			}
		}
	})
	@jwt_required()
	def delete(self, id):
		try:
			user = User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			user = User.objects.get(id=request.params)
			user.delete()
			return 'ok'
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception:
			raise InternalServerError