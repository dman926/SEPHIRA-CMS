'''
Admin routes
'''

from flask import jsonify, request
from flask_restful_swagger_2 import Resource, swagger
from flask_jwt_extended import jwt_required, get_jwt_identity

from mongoengine.errors import DoesNotExist, FieldDoesNotExist, ValidationError, InvalidQueryError
from resources.errors import UnauthorizedError, InternalServerError, ResourceNotFoundError, SchemaValidationError, InvalidPostTypeError

import database.models as models

from services.util_service import all_subclasses, is_post
from services.logging_service import writeWarningToLog

import datetime, os

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
			user = models.User.objects.get(id=get_jwt_identity())
			return user.admin
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminApi get', e)
			raise InternalServerError

class AdminUsersApi(Resource):
	@swagger.doc({
		'tags': ['Admin', 'User'],
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
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			page = int(request.args.get('page', 0))
			size = int(request.args.get('size', models.User.objects.count()))
			users = models.User.objects[page * size : page * size + size]
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
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			user = models.User.objects.get(id=id)
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
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			user = models.User.objects.get(id=id)
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
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			user = models.User.objects.get(id=id)
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
		'tags': ['Admin', 'User', 'Counter'],
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
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			return models.User.objects.count()
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminUsersCountApi get', e)
			raise InternalServerError

class AdminPostTypesApi(Resource):
	@swagger.doc({
		'tags': ['Admin', 'Post'],
		'description': 'Get all post types, exluding Post',
		'responses': {
			'200': {
				'description': 'An array post types'
			}
		}
	})
	@jwt_required()
	def get(self):
		try:
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			return jsonify(list(map(lambda s: s.__module__[9:] + '.' + s.__name__, all_subclasses(models.Post))))
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminPostTypesApi get', e)
			raise InternalServerError

class AdminPostSchemaApi(Resource):
	@swagger.doc({
		'tags': ['Admin', 'Post'],
		'description': 'Get the schema of a post type',
		'parameters': [
			{
				'name': 'post',
				'description': 'The post type',
				'in': 'query',
				'type': 'string',
				'schema': None,
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'The schema of the post type'
			}
		}
	})
	@jwt_required()
	def get(self):
		try:
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			postType = request.args.get('post', None)
			if not postType:
				raise SchemaValidationError
			try:
				postType = eval(postType)
				if not is_post(postType):
					raise InvalidPostTypeError
			except Exception:
				raise InvalidPostTypeError
			return jsonify(postType.schema())
		except SchemaValidationError:
			raise SchemaValidationError
		except InvalidPostTypeError:
			raise InvalidPostTypeError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminPostSchemaApi get', e)
			raise InternalServerError


class AdminPostsApi(Resource):
	@swagger.doc({
		'tags': ['Admin', 'Post'],
		'description': 'Get all Post of specified type',
		'parameters': [
			{
				'name': 'post',
				'description': 'The post type',
				'in': 'query',
				'type': 'string',
				'schema': None,
				'required': True
			},
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
			},
			{
				'name': 'search',
				'description': 'An optional search term',
				'in': 'query',
				'type': 'string',
				'schema': None,
				'required': False
			}
		],
		'responses': {
			'200': {
				'description': 'An array of the specified post type'
			}
		}
	})
	@jwt_required()
	def get(self):
		try:
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			postType = request.args.get('post', None)
			if not postType:
				raise SchemaValidationError
			try:
				postType = eval(postType)
				if not is_post(postType):
					raise InvalidPostTypeError
			except Exception:
				raise InvalidPostTypeError
			search = request.args.get('search', None)
			objs = postType.objects()
			if search:
				objs = objs.search_text(search).order_by('$text_score')
			page = int(request.args.get('page', 0))
			size = int(request.args.get('size', objs.count()))
			return jsonify({
				'count': objs.count(),
				'posts': list(map(lambda s: s.serialize(), objs[page * size : page * size + size]))
			})
		except UnauthorizedError:
			raise UnauthorizedError
		except SchemaValidationError:
			raise SchemaValidationError
		except InvalidPostTypeError:
			raise InvalidPostTypeError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminPostsApi get', e)
			raise InternalServerError
	@swagger.doc({
		'tags': ['Admin', 'Post'],
		'description': 'Add new post of type',
		'parameters': [
			{
				'name': 'post',
				'description': 'The post type',
				'in': 'query',
				'type': 'string',
				'schema': None,
				'required': True
			},
			{
				'name': 'obj',
				'description': 'The post type object',
				'in': 'query',
				'type': 'object',
				'schema': None,
				'required': True
			},
		],
		'responses': {
			'200': {
				'description': 'Post added',
			}
		}
	})
	@jwt_required()
	def post(self):
		try:
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			body = request.get_json()
			postType = body.get('post', None)
			obj = body.get('obj', None)
			if not postType or not obj:
				raise SchemaValidationError
			try:
				postType = eval(postType)
				if not is_post(postType):
					raise InvalidPostTypeError
			except Exception:
				raise InvalidPostTypeError
			obj = postType(**obj)
			obj.author = user

			postTypeName = postType.__name__
			
			# Do any aditional logic here.
			# Just check with a simple `if postTypeName == POSTTYPENAME:` to see the class name coming in. Do not rely on request.args.get('post', None)

			obj.save()
			return jsonify(obj.serialize())
		except (FieldDoesNotExist, ValidationError, SchemaValidationError):
			raise SchemaValidationError
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminPostsApi post', e)
			raise InternalServerError

class AdminPostApi(Resource):
	@swagger.doc({
		'tags': ['Admin', 'Post'],
		'description': 'Get post of type',
		'parameters': [
			{
				'name': 'post',
				'description': 'The post type',
				'in': 'query',
				'type': 'string',
				'schema': None,
				'required': True
			},
			{
				'name': 'id',
				'description': 'The post id',
				'in': 'path',
				'type': 'string',
				'schema': None,
				'required': True
			},
			{
				'name': 'withSchema',
				'description': 'If the class schema should be included',
				'in': 'query',
				'type': 'bool',
				'schema': None,
				'required': False
			}
		],
		'responses': {
			'200': {
				'description': 'The post'
			}
		}
	})
	@jwt_required()
	def get(self, id):
		try:
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			postType = request.args.get('post', None)
			if not postType:
				raise SchemaValidationError
			try:
				postType = eval(postType)
			except Exception:
				raise InvalidPostTypeError
			obj = postType.objects.get(id=id)
			out = {'obj': obj.serialize()}
			if bool(request.args.get('withSchema', False)):
				out['schema'] = postType.schema()
			return jsonify(out)
		except UnauthorizedError:
			raise UnauthorizedError
		except SchemaValidationError:
			raise SchemaValidationError
		except DoesNotExist:
			raise ResourceNotFoundError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminPostApi get', e)
			raise InternalServerError
	@swagger.doc({
		'tags': ['Admin', 'Page'],
		'description': 'Update page',
		'parameters': [
			{
				'name': 'post',
				'description': 'The post type',
				'in': 'body',
				'type': 'string',
				'schema': None,
				'required': True
			},
			{
				'name': 'id',
				'description': 'The post id',
				'in': 'path',
				'type': 'string',
				'schema': None,
				'required': True
			},
			{
				'name': 'obj',
				'description': 'The post object',
				'in': 'body',
				'type': 'string',
				'schema': None,
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'Post updated'
			}
		}
	})
	@jwt_required()
	def put(self, id):
		try:
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			body = request.get_json()
			postType = body.get('post', None)
			newObj = body.get('obj', None)
			if not postType or not newObj:
				raise SchemaValidationError
			try:
				postType = eval(postType)
			except Exception:
				raise InvalidPostTypeError
			obj = postType.objects.get(id=id)

			postTypeName = postType.__name__
			if postTypeName == 'Coupon':
				if newObj['applicableProducts']:
					newObj['applicableProducts'] = list(map(lambda p: models.Product.objects.get(id=p), newObj['applicableProducts']))

			obj.update(**newObj)
			obj.reload()
			obj.modified = datetime.datetime.now
			obj.generateNgrams()
			obj.save()
			return 'ok'
		except UnauthorizedError:
			raise UnauthorizedError
		except SchemaValidationError:
			raise SchemaValidationError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminPostApi put', e)
			raise InternalServerError
	@swagger.doc({
		'tags': ['Admin', 'Post'],
		'description': 'Delete post',
		'parameters': [
			{
				'name': 'post',
				'description': 'The post type',
				'in': 'query',
				'type': 'string',
				'schema': None,
				'required': True
			},
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
				'description': 'Post deleted'
			}
		}
	})
	@jwt_required()
	def delete(self, id):
		try:
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			postType = request.args.get('post', None)
			if not postType:
				raise SchemaValidationError
			try:
				postType = eval(postType)
			except Exception:
				raise InvalidPostTypeError
			postType.objects.get(id=id).delete()
			return 'ok'
		except UnauthorizedError:
			raise UnauthorizedError
		except SchemaValidationError:
			raise SchemaValidationError
		except DoesNotExist:
			raise ResourceNotFoundError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminPostApi delete', e)
			raise InternalServerError

class AdminPostSlugAvailableApi(Resource):
	@swagger.doc({
		'tags': ['Admin', 'Post', 'Validator'],
		'description': 'Get if this post slug is taken',
		'parameters': [
			{
				'name': 'post',
				'description': 'The post type',
				'in': 'query',
				'type': 'string',
				'schema': None,
				'required': True
			},
			{
				'name': 'slug',
				'description': 'The post slug',
				'in': 'query',
				'schema': None,
				'type': 'string',
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'If the post slug is taken',
			}
		}
	})
	@jwt_required()
	def get(self):
		try:
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			postType = request.args.get('post', None)
			if not postType:
				raise SchemaValidationError
			try:
				postType = eval(postType)
			except Exception:
				raise InvalidPostTypeError
			postType.objects.get(slug=request.args.get('slug'))
			return False
		except DoesNotExist:
			return True
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminPostSlugAvailableApi get', e)
			raise InternalServerError

class AdminMenuItemsApi(Resource):
	@swagger.doc({
		'tags': ['Admin', 'Menu Item'],
		'description': 'Get all Menu Items',
		'responses': {
			'200': {
				'description': 'An array of Menu Item'
			}
		}
	})
	@jwt_required()
	def get(self):
		try:
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			menuItems = models.MenuItem.objects()
			return jsonify(list(map(lambda p: p.serialize(), menuItems)))
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminMenuItemsApi get', e)
			raise InternalServerError
	@swagger.doc({
		'tags': ['Admin', 'Menu Item'],
		'description': 'Save Menu Items structure',
		'parameters': [
			{
				'name': '',
				'description': 'An array of menu items',
				'in': 'body',
				'type': 'object',
				'schema': None,
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'Menu Items saved',
			}
		}
	})
	@jwt_required()
	def post(self):
		try:
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			models.MenuItem.objects().delete() # remove all old menu items
			for item in request.get_json():
				models.MenuItem(**item).save()
			return 'ok'
		except (FieldDoesNotExist, ValidationError):
			raise SchemaValidationError
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminMenuItemsApi post', e)
			raise InternalServerError

class AdminOrdersApi(Resource):
	@swagger.doc({
		'tags': ['Admin', 'Order'],
		'description': 'Get all orders according to pagination criteria',
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
				'description': 'An array of Order'
			}
		}
	})
	@jwt_required()
	def get(self):
		try:
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			page = int(request.args.get('page', 0))
			size = int(request.args.get('size', models.Order.objects.count()))
			orders = models.Order.objects[page * size : page * size + size]
			return jsonify(list(map(lambda o: o.serialize(), orders)))
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminOrdersApi get', e)
			raise InternalServerError

class AdminOrderApi(Resource):
	@swagger.doc({
		'tags': ['Admin', 'Order'],
		'description': 'Get the order',
		'parameters': [
			{
				'name': 'id',
				'description': 'The order id',
				'in': 'path',
				'type': 'string',
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'The order',
			}
		}
	})
	@jwt_required()
	def get(self, id):
		try:
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			order = models.Order.objects.get(id=id)
			return jsonify(order.serialize())
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminOrderApi get', e)
			raise InternalServerError
	@swagger.doc({
		'tags': ['Admin', 'Order'],
		'description': 'Update the order',
		'parameters': [
			{
				'name': 'id',
				'description': 'The order id',
				'in': 'path',
				'type': 'string',
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'Order updated',
			}
		}
	})
	@jwt_required()
	def put(self, id):
		try:
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			order = models.Order.objects.get(id=id)
			order.update(**request.get_json())
			order.reload()
			order.modified = datetime.datetime.now
			order.save()
			return 'ok', 200
		except InvalidQueryError:
			raise SchemaValidationError
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminOrderApi put', e)
			raise InternalServerError
	@swagger.doc({
		'tags': ['Admin', 'Order'],
		'description': 'Delete the Order',
		'parameters': [
			{
				'name': 'id',
				'description': 'The order id',
				'in': 'path',
				'type': 'string',
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'Order deleted',
			}
		}
	})
	@jwt_required()
	def delete(self, id):
		try:
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			models.Order.objects.get(id=id).delete()
			return 'ok', 200
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminOrderApi delete', e)
			raise InternalServerError

class AdminOrderCountApi(Resource):
	@swagger.doc({
		'tags': ['Admin', 'Order', 'Counter'],
		'description': 'Get the number of orders',
		'responses': {
			'200': {
				'description': 'The number of orders',
			}
		}
	})
	@jwt_required()
	def get(self):
		try:
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			return models.Order.objects.count()
		except UnauthorizedError:
			return UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminOrderCountApi get', e)
			raise InternalServerError

class AdminUsShippingZonesApi(Resource):
	@swagger.doc({
		'tags': ['Admin', 'Shipping'],
		'description': 'Get all US shipping zones according to pagination criteria',
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
				'description': 'An array of UsShippingZone'
			}
		}
	})
	@jwt_required()
	def get(self):
		try:
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			page = int(request.args.get('page', 0))
			size = int(request.args.get('size', models.Order.objects.count()))
			shippingZones = models.UsShippingZone.objects[page * size : page * size + size]
			return jsonify(list(map(lambda s: s.serialize(), shippingZones)))
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminUsShippingZonesApi get', e)
			raise InternalServerError
	@swagger.doc({
		'tags': ['Admin', 'Shipping'],
		'description': 'Add new shipping zone',
		'responses': {
			'200': {
				'description': 'Shipping zone added',
			}
		}
	})
	@jwt_required()
	def post(self):
		try:
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			zone = models.UsShippingZone(**request.get_json())
			try:
				models.UsShippingZone.objects.get(default=True)
			except DoesNotExist:
				zone.default = True
			zone.save()
			return jsonify(zone.serialize())
		except (FieldDoesNotExist, ValidationError):
			raise SchemaValidationError
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminUsShippingZonesApi post', e)
			raise InternalServerError

class AdminUsShippingZoneApi(Resource):
	@swagger.doc({
		'tags': ['Admin', 'Shipping'],
		'description': 'Get the US shipping zone',
		'parameters': [
			{
				'name': 'id',
				'description': 'The US shipping zone id',
				'in': 'path',
				'type': 'string',
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'The US shipping zone',
			}
		}
	})
	@jwt_required()
	def get(self, id):
		try:
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			shippingZone = models.UsShippingZone.objects.get(id=id)
			return jsonify(shippingZone.serialize())
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminUsShippingZoneApi get', e)
			raise InternalServerError
	@swagger.doc({
		'tags': ['Admin', 'Shipping'],
		'description': 'Update the US shipping zone',
		'parameters': [
			{
				'name': 'id',
				'description': 'The us shipping zone id',
				'in': 'path',
				'type': 'string',
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'US shipping zone updated',
			}
		}
	})
	@jwt_required()
	def put(self, id):
		try:
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			models.UsShippingZone.objects.get(id=id).update(**request.get_json())
			return 'ok', 200
		except InvalidQueryError:
			raise SchemaValidationError
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminUsShippingZoneApi put', e)
			raise InternalServerError
	@swagger.doc({
		'tags': ['Admin', 'Shipping'],
		'description': 'Delete the coupon',
		'parameters': [
			{
				'name': 'id',
				'description': 'The coupon id',
				'in': 'path',
				'type': 'string',
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'Coupon deleted',
			}
		}
	})
	@jwt_required()
	def delete(self, id):
		try:
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			models.UsShippingZone.objects.get(id=id).delete()
			return 'ok', 200
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminUsShippingZoneApi delete', e)
			raise InternalServerError

class AdminUsShippingZoneCountApi(Resource):
	@swagger.doc({
		'tags': ['Admin', 'Shipping', 'Counter'],
		'description': 'Get the number of US shipping zones',
		'responses': {
			'200': {
				'description': 'The number of US shipping zones',
			}
		}
	})
	@jwt_required()
	def get(self):
		try:
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			return models.UsShippingZone.objects.count()
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminUsShippingZoneCountApi get', e)
			raise InternalServerError

class AdminBackendEditorFilesApi(Resource):
	@swagger.doc({
		'tags': ['Admin', 'Backend Editor'],
		'description': 'Get the file structure of the backend',
		'responses': {
			'200': {
				'description': 'An array of files and directories',
			}
		}
	})
	@jwt_required()
	def get(self):
		def getFileTree(dir):
			files = []
			cwd = os.getcwd()
			with os.scandir(dir) as it:
				for entry in it:
					file = {
						'path': entry.path[len(cwd):] # Strip cwd from the path
					}
					if entry.is_dir():
						if entry.name == '__pycache__' or entry.name == 'venv':
							continue # Ignore pycache and venv folders
						file['isDir'] = True
						file['children'] = getFileTree(entry.path)
					files.append(file)
			return files


		try:
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			return jsonify(getFileTree(os.getcwd()))
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminBackendEditorFilesApi get', e)
			raise InternalServerError

class AdminBackendEditorFileApi(Resource):
	@swagger.doc({
		'tags': ['Admin', 'Backend Editor'],
		'description': 'Get the contents of the requested file',
		'parameters': [
			{
				'name': 'path',
				'description': 'The file path',
				'in': 'query',
				'type': 'string',
				'schema': None,
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'The contents of the requested file',
			}
		}
	})
	@jwt_required()
	def get(self):
		try:
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			path = request.args.get('path', None)
			if not path:
				raise SchemaValidationError
			f = open(os.path.join(os.getcwd(), path[1:]), 'r')
			lines = ''.join(f.readlines())
			f.close()
			return lines
		except UnauthorizedError:
			raise UnauthorizedError
		except SchemaValidationError:
			raise SchemaValidationError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminBackendEditorFileApi get', e)
			raise InternalServerError
	@swagger.doc({
		'tags': ['Admin', 'Backend Editor'],
		'description': 'Overwrite the contents of the file',
		'parameters': [
			{
				'name': 'path',
				'description': 'The file path',
				'in': 'body',
				'type': 'string',
				'schema': None,
				'required': True
			},
			{
				'name': 'content',
				'description': 'The new content',
				'in': 'body',
				'type': 'string',
				'schema': None,
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'Successful of file overwrite',
			}
		}
	})
	@jwt_required()
	def put(self):
		try:
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			body = request.get_json()
			path = body.get('path', None)
			if not path:
				raise SchemaValidationError
			f = open(os.path.join(os.getcwd(), path[1:]), 'w')
			f.write(body.get('content'))
			f.close()
			return 'ok'
		except UnauthorizedError:
			raise UnauthorizedError
		except SchemaValidationError:
			raise SchemaValidationError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminBackendEditorFileApi put', e)
			raise InternalServerError

class AdminServerRestartApi(Resource):
	@swagger.doc({
		'tags': ['Admin', 'Server Management'],
		'description': 'Add a request to restart the server',
		'responses': {
			'200': {
				'description': 'Successfuly added request to restart the server',
			}
		}
	})
	@jwt_required()
	def post(self):
		try:
			user = models.User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError

			return 'ok'
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.admin.AdminServerRestartApi post', e)
			raise InternalServerError