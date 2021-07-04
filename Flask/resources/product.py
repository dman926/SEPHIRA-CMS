'''
Product routes
'''

from flask import jsonify, request
from flask_restful_swagger_2 import Resource, swagger
from flask_jwt_extended import jwt_required, get_jwt_identity

from mongoengine.errors import FieldDoesNotExist, NotUniqueError, DoesNotExist, ValidationError, InvalidQueryError
from resources.errors import SchemaValidationError, InternalServerError, UnauthorizedError

from database.models import Product

from services.logging_service import writeWarningToLog

class ProductsApi(Resource):
	@swagger.doc({
		'tags': ['Product'],
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
	def get(self):
		try:
			page = int(request.args.get('page', 0))
			size = int(request.args.get('size', Product.objects.count()))
			products = Product.objects[page * size : page * size + size]
			return jsonify(list(map(lambda p: p.serialize(), products)))
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.product.ProductsApi get', e)
			raise InternalServerError

class ProductApi(Resource):
	@swagger.doc({
		'tags': ['Product'],
		'description': 'Get the product with associated slug',
		'parameters': [
			{
				'name': 'slug',
				'description': 'The page slug',
				'in': 'query',
				'type': 'string',
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'A product',
			}
		}
	})
	def get(self):
		try:
			product = Product.objects.get(slug=request.args.get('slug'))
			return jsonify(product.serialize())
		except DoesNotExist:
			raise ResourceNotFoundError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.product.ProductApi get', e)
			raise InternalServerError

class ProductCountApi(Resource):
	@swagger.doc({
		'tags': ['Product', 'Counter'],
		'description': 'Get the number of products',
		'parameters': [
			{
				'name': 'status',
				'description': 'A list of possible statuses',
				'in': 'query',
				'type': 'string',
				'required': False
			}
		],
		'responses': {
			'200': {
				'description': 'The number of products',
			}
		}
	})
	def get(self):
		try:
			return Product.objects(status__in=list(request.args['status'])).count()
		except UnauthorizedError:
			return UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.product.ProductCountApi get', e)
			raise InternalServerError