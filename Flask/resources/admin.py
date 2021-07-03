'''
Admin routes
'''

from flask import jsonify, request
from flask_restful_swagger_2 import Resource, swagger
from flask_jwt_extended import jwt_required, get_jwt_identity

from mongoengine.errors import DoesNotExist
from resources.errors import UnauthorizedError, InternalServerError, ResourceNotFoundError

from database.models import User, Page, Product

from services.logging_service import writeWarningToLog

class AdminApi(Resource):
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
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminApi get', e)
			raise InternalServerError

class AdminUsersApi(Resource):
	@swagger.doc({
		'tags': ['Admin'],
		'description': 'Get all users according to pagination criteria',
		'parameters': [
			{
				'name': 'page',
				'description': 'The page index',
				'in': 'query',
				'type': 'int',
				'schema': None,
				'required': False
			},
			{
				'name': 'size',
				'description': 'The page size',
				'in': 'query',
				'type': 'int',
				'schema': None,
				'required': False
			}
		],
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
			page = int(request.args.get('page', 0))
			size = int(request.args.get('size', User.objects.count()))
			users = User.objects[page * size : page * size + size]
			return jsonify(list(map(lambda u: u.serialize(), users)))
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminUsersApi get', e)
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
			return jsonify(user.serialize())
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminUserApi get', e)
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
			user = User.objects.get(id=id)
			user.update(**request.get_json())
			return 'ok'
		except UnauthorizedError:
			raise UnauthorizedError
		except DoesNotExist:
			raise ResourceNotFoundError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminUserApi put', e)
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
			user = User.objects.get(id=id)
			user.delete()
			return 'ok'
		except UnauthorizedError:
			raise UnauthorizedError
		except DoesNotExist:
			raise ResourceNotFoundError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminUserApi delete', e)
			raise InternalServerError

class AdminUsersCountApi(Resource):
	@swagger.doc({
		'tags': ['Admin'],
		'description': 'Get the amount of users',
		'responses': {
			'200': {
				'description': 'The amount of users'
			}
		}
	})
	@jwt_required()
	def get(self):
		try:
			user = User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			return User.objects.count()
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminUsersCountApi get', e)
			raise InternalServerError

class AdminPagesApi(Resource):
	@swagger.doc({
		'tags': ['Admin'],
		'description': 'Get all pages according to pagination criteria',
		'parameters': [
			{
				'name': 'page',
				'description': 'The page index',
				'in': 'query',
				'type': 'int',
				'schema': None,
				'required': False
			},
			{
				'name': 'size',
				'description': 'The page size',
				'in': 'query',
				'type': 'int',
				'schema': None,
				'required': False
			}
		],
		'responses': {
			'200': {
				'description': 'An array of Page'
			}
		}
	})
	@jwt_required()
	def get(self):
		try:
			user = User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			page = int(request.args.get('page', 0))
			size = int(request.args.get('size', User.objects.count()))
			pages = Page.objects[page * size : page * size + size]
			return jsonify(list(map(lambda p: p.serialize(), pages)))
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminPagesApi get', e)
			raise InternalServerError
	@swagger.doc({
		'tags': ['Admin'],
		'description': 'Create new Page',
		'responses': {
			'200': {
				'description': 'Page added'
			}
		}
	})
	@jwt_required()
	def post(self):
		try:
			user = User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			page = Page(**request.get_json()['page'], author=user)
			page.save()
			return jsonify(page.serialize())
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminPagesApi post', e)
			raise InternalServerError

class AdminPageApi(Resource):
	@swagger.doc({
		'tags': ['Admin'],
		'description': 'Get page',
		'parameters': [
			{
				'name': 'id',
				'description': 'The page id',
				'in': 'path',
				'type': 'string',
				'schema': None,
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'The page'
			}
		}
	})
	@jwt_required()
	def get(self, id):
		try:
			user = User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			page = Page.objects.get(id=id)
			return jsonify(page)
		except UnauthorizedError:
			raise UnauthorizedError
		except DoesNotExist:
			raise ResourceNotFoundError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminPostApi get', e)
			raise InternalServerError
	@swagger.doc({
		'tags': ['Admin'],
		'description': 'Update page',
		'parameters': [
			{
				'name': 'id',
				'description': 'The page id',
				'in': 'path',
				'type': 'object',
				'schema': None,
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'Page updated'
			}
		}
	})
	@jwt_required()
	def put(self, id):
		try:
			user = User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			Page.objects.get(id=id).update(**request.get_json())
			return 'ok'
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminPageApi put', e)
			raise InternalServerError
	@swagger.doc({
		'tags': ['Admin'],
		'description': 'Delete page',
		'parameters': [
			{
				'name': 'id',
				'description': 'The page id',
				'in': 'path',
				'type': 'string',
				'schema': None,
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'Page deleted'
			}
		}
	})
	@jwt_required()
	def delete(self, id):
		try:
			user = User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			Page.objects.get(id=id).delete()
			return 'ok'
		except UnauthorizedError:
			raise UnauthorizedError
		except DoesNotExist:
			raise ResourceNotFoundError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminPageApi delete', e)
			raise InternalServerError

class AdminPagesCountApi(Resource):
	@swagger.doc({
		'tags': ['Admin'],
		'description': 'Get the amount of pages',
		'responses': {
			'200': {
				'description': 'The amount of pages'
			}
		}
	})
	@jwt_required()
	def get(self):
		try:
			user = User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			return Page.objects.count()
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminPagesCountApi get', e)
			raise InternalServerError

class AdminPageSlugApi(Resource):
	@swagger.doc({
		'tags': ['Auth', 'Post', 'Validator'],
		'description': 'Get if this page slug is taken',
		'responses': {
			'200': {
				'description': 'If the slug is taken'
			}
		}
	})
	@jwt_required()
	def get(self):
		try:
			user = User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			Page.objects.get(slug=request.args.get('slug'))
			return False
		except DoesNotExist:
			return True
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminPageSlugApi get', e)
			raise InternalServerError

class AdminProductsApi(Resource):
	@swagger.doc({
		'tags': ['Product'],
		'description': 'Add new product',
		'parameters': [
			{
				'name': 'product',
				'description': 'A product object',
				'in': 'body',
				'type': 'object',
				'schema': None,
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'Product added',
			}
		}
	})
	@jwt_required()
	def post(self):
		try:
			user = User.objects.get(id=get_jwt_identity())
			if not user.isVendor:
				raise UnauthorizedError
			vendor = Vendor.objects.get(owner=user)
			product = Product(**request.get_json().get('product'), author=user)
			product.nameNgrams = u' '.join(make_ngrams(product.name.lower()))
			product.namePrefixNgrams = u' '.join(make_ngrams(product.name.lower(), True))
			product.categoriesPrefixNgrams = list(map(lambda c: u' '.join(make_ngrams(c.lower(), True)), product.categories))
			product.save()
			return jsonify(product.serialize())
		except (FieldDoesNotExist, ValidationError):
			raise SchemaValidationError
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminProductsApi post', e)
			raise InternalServerError
