'''
Product routes
'''

from flask import jsonify, request
from flask_restful_swagger_2 import Resource, swagger
from flask_jwt_extended import jwt_required, get_jwt_identity

from mongoengine.errors import FieldDoesNotExist, NotUniqueError, DoesNotExist, ValidationError, InvalidQueryError
from resources.errors import SchemaValidationError, InternalServerError, UnauthorizedError

from database.models import Product, User

class ProductsApi(Resource):
	@swagger.doc({
		'tags': ['Product'],
		'description': 'Get all products according to search criteria',
		'parameters': [
			{
				'name': 's',
				'description': 'The search term',
				'in': 'query',
				'type': 'string',
				'required': False
			}
		],
		'responses': {
			'200': {
				'description': 'Array of Product',
			}
		}
	})
	def get(self):
		search = request.args.get('s')
		print(search)
		if search:
			products = Product.objects.search_text(search).order_by('$text_score')
		else:
			products = Product.objects
		mappedProducts = list(map(lambda p: p.serialize(), products))
		return jsonify(mappedProducts)
	@swagger.doc({
		'tags': ['Product'],
		'description': 'Add new product',
		'parameters': [
			{
				'name': 'Product',
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
			if not user.admin:
				raise UnauthorizedError
			product = Product(**request.get_json())
			product.save()
			id = product.id
			return {'id': str(id)}, 200
		except (FieldDoesNotExist, ValidationError):
			raise SchemaValidationError
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception:
			raise InternalServerError


class ProductApi(Resource):
	@swagger.doc({
		'tags': ['Product'],
		'description': 'Get the product',
		'parameters': [
			{
				'name': 'id',
				'description': 'The item id',
				'in': 'path',
				'type': 'string',
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'The product',
			}
		}
	})
	def get(self, id):
		product = Product.objects.get(id=id)
		return jsonify(product.serialize())
	@swagger.doc({
		'tags': ['Product'],
		'description': 'Update the product',
		'parameters': [
			{
				'name': 'id',
				'description': 'The item id',
				'in': 'path',
				'type': 'string',
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'Product updated',
			}
		}
	})
	@jwt_required()
	def put(self, id):
		try:
			user = User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			product = Product.objects.get(id=id)
			product.update(**request.get_json())
			return 'ok', 200
		except InvalidQueryError:
			raise SchemaValidationError
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception:
			raise InternalServerError       
	@swagger.doc({
		'tags': ['Product'],
		'description': 'Delete the product',
		'parameters': [
			{
				'name': 'id',
				'description': 'The item id',
				'in': 'path',
				'type': 'string',
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'Product deleted',
			}
		}
	})
	@jwt_required()
	def delete(self, id):
		try:
			user = User.objects.get(id=get_jwt_identity())
			if not user.admin:
				raise UnauthorizedError
			product = Product.objects.get(id=id)
			product.delete()
			return 'ok', 200
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception:
			raise InternalServerError