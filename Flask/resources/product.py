'''
Product routes
'''

from flask import jsonify, request
from flask_restful_swagger_2 import Resource, swagger
from flask_jwt_extended import jwt_required, get_jwt_identity

from mongoengine.errors import NotUniqueError, DoesNotExist, ValidationError
from resources.errors import SchemaValidationError, InternalServerError, UnauthorizedError, ResourceNotFoundError

from database.models import Product, Review, Order

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
		'responses': {
			'200': {
				'description': 'The number of products',
			}
		}
	})
	def get(self):
		try:
			return Product.objects.count()
		except UnauthorizedError:
			return UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.product.ProductCountApi get', e)
			raise InternalServerError

class ProductReviewsApi(Resource):
	@swagger.doc({
		'tags': ['Product', 'Review'],
		'description': 'Get the Reviews of the product according to pagination criteria',
		'parameters': [
			{
				'name': 'id',
				'description': 'The product id',
				'in': 'path',
				'schema': None,
				'type': 'string',
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
			}
		],
		'responses': {
			'200': {
				'description': 'The Reviews of the product according to pagination criteria',
			}
		}
	})
	def get(self, id):
		try:
			reviews = Review.objects(product=id)
			page = int(request.args.get('page', 0))
			size = int(request.args.get('size', reviews.count()))
			reviews = list(map(lambda r: r.serialize(), reviews[page * size : page * size + size]))
			return jsonify(reviews)
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.product.ProductReviewsApi get', e)
	@swagger.doc({
		'tags': ['Product', 'Review'],
		'description': 'Attempt to add a review',
		'parameters': [
			{
				'name': 'id',
				'description': 'The product id',
				'in': 'path',
				'schema': None,
				'type': 'string',
				'required': True
			},
			{
				'name': '',
				'description': 'The Review object',
				'in': 'body',
				'schema': None,
				'type': 'string',
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'Review added',
			}
		}
	})
	@jwt_required()
	def post(self, id):
		try:
			orderCount = Order.objects(orderer=get_jwt_identity(), products__product=id, orderStatus__ne='not placed').count()
			if orderCount == 0:
				raise UnauthorizedError
			review = Review(reviewer=get_jwt_identity(), **request.get_json())
			review.save()
			product = Product.objects.get(id=id)
			product.addReview(review.score)
			product.save()
			return jsonify(review.serialize())
		except (UnauthorizedError, NotUniqueError):
			raise UnauthorizedError
		except ValidationError:
			raise SchemaValidationError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.product.ProductReviewsApi post', e)

class ProductReviewsCountApi(Resource):
	@swagger.doc({
		'tags': ['Product', 'Counter'],
		'description': 'Get the number of products',
		'responses': {
			'200': {
				'description': 'The number of products',
			}
		}
	})
	def get(self, id):
		try:
			product = Product.objects.get(id=id)
			return Review.objects(product=product).count()
		except UnauthorizedError:
			return UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.product.ProductCountApi get', e)
			raise InternalServerError

class ProductReviewAllowedApi(Resource):
	@swagger.doc({
		'tags': ['Product', 'Review'],
		'description': 'Get the Reviews of the product according to pagination criteria',
		'parameters': [
			{
				'name': 'id',
				'description': 'The product id',
				'in': 'path',
				'schema': None,
				'type': 'string',
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'The Reviews of the product according to pagination criteria',
			}
		}
	})
	@jwt_required(optional=True)
	def get(self, id):
		try:
			identity = get_jwt_identity()
			if not identity:
				return False
			orderCount = Order.objects(orderer=identity, products__product=id, orderStatus__ne='not placed').count()
			return orderCount > 0
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.product.ProductReviewApi get', e)