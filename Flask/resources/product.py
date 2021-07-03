'''
Product routes
'''

from flask import jsonify, request
from flask_restful_swagger_2 import Resource, swagger
from flask_jwt_extended import jwt_required, get_jwt_identity

from mongoengine.errors import FieldDoesNotExist, NotUniqueError, DoesNotExist, ValidationError, InvalidQueryError
from resources.errors import SchemaValidationError, InternalServerError, UnauthorizedError

from database.models import Product, User, Vendor, Review, Order
from services.util_service import make_ngrams
from services.logging_service import writeWarningToLog

class ProductCountApi(Resource):
	@swagger.doc({
		'tags': ['Product', 'Count'],
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
			return Product.objects(status=list(request.args['status'])).count()
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.product.ProductCountApi get', e)
			raise InternalServerError

class ProductsApi(Resource):
	@swagger.doc({
		'tags': ['Product'],
		'description': 'Get all products according to search criteria',
		'parameters': [
			{
				'name': 'search',
				'description': 'The search term',
				'in': 'query',
				'type': 'string',
				'required': False
			},
			{
				'name': 'page',
				'description': 'The start page',
				'in': 'query',
				'type': 'int',
				'required': True
			},
			{
				'name': 'size',
				'description': 'The page size',
				'in': 'query',
				'type': 'int',
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'Array of Product',
			}
		}
	})
	def get(self):
		try:
			search = request.args.get('search')
			page = int(request.args.get('page'))
			pageSize = int(request.args.get('size'))
			if search:
				products = Product.objects(active=True).search_text(search).order_by('$text_score')[page * pageSize:page * pageSize + pageSize]
			else:
				products = Product.objects(active=True)[page * pageSize:page * pageSize + pageSize]
			mappedProducts = list(map(lambda p: p.serialize(), products))
			return jsonify(mappedProducts)
		except DoesNotExist:
			return jsonify([])
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.product.ProductsApi get', e)
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
		try:
			product = Product.objects.get(id=id)
			if product.active or product.vendor.owner == get_jwt_identity:
				return jsonify(product.serialize())
			raise UnauthorizedError
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.product.ProductApi get', e)
			raise InternalServerError
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
			if product.price and product.price < 0:
				product.price = 0
			product.nameNgrams = u' '.join(make_ngrams(product.name.lower()))
			product.namePrefixNgrams = u' '.join(make_ngrams(product.name.lower(), True))
			product.categoriesPrefixNgrams = list(map(lambda c: u' '.join(make_ngrams(c.lower(), True)), product.categories))
			product.save()
			return 'ok', 200
		except InvalidQueryError:
			raise SchemaValidationError
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.product.ProductApi put', e)
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
			product = Product.objects.get(id=id)
			product.active = False
			product.save()
			return 'ok', 200
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.product.ProductApi delete', e)
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
				'description': 'The start page',
				'in': 'query',
				'type': 'int',
				'required': False
			},
			{
				'name': 'size',
				'description': 'The page size',
				'in': 'query',
				'type': 'int',
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
			page = int(request.args.get('page', 0))
			size = int(request.args.get('size', Review.objects(product=id).count))
			reviews = list(map(lambda r: r.serialize(), Review.objects(product=id)))[page * size : page * size + size]
			return jsonify(reviews)
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.product.ProductReviewApi get', e)
			raise InternalServerError
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
				'name': 'review',
				'description': 'The Review object',
				'in': 'body',
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
	@jwt_required()
	def post(self, id):
		try:
			orderCount = Order.objects(orderer=get_jwt_identity(), products__product=id, orderStatus__ne='not placed').count()
			if orderCount == 0:
				raise UnauthorizedError
			review = Review(reviewer=get_jwt_identity(), **request.get_json().get('review'))
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
			writeWarningToLog('Unhandled exception in resources.product.ProductReviewApi post', e)
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
			raise InternalServerError
	
class ProductSlugApi(Resource):
	@swagger.doc({
		'tags': ['Product'],
		'description': 'Get the product',
		'parameters': [
			{
				'name': 'storeSlug',
				'description': 'The store slug',
				'in': 'path',
				'type': 'string',
				'required': True
			},
			{
				'name': 'productSlug',
				'description': 'The product slug',
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
	def get(self, storeSlug, productSlug):
		try:
			vendor = Vendor.objects.get(slug=storeSlug)
			product = Product.objects.get(vendor=vendor, slug=productSlug)
			return jsonify((product.serialize()))
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.product.ProductSlugApi get', e)
			raise InternalServerError

class ProductSlugAvailableApi(Resource):
	@swagger.doc({
		'tags': ['Product', 'Validator'],
		'description': 'Get if this product slug is taken',
		'parameters': [
			{
				'name': 'slug',
				'description': 'The product slug',
				'in': 'body',
				'schema': None,
				'type': 'string',
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'If the product slug is taken',
			}
		}
	})
	@jwt_required()
	def post(self):
		try:
			body = request.get_json()
			productSlug = body['slug']
			vendor = Vendor.objects.get(owner=get_jwt_identity())
			for product in vendor.products:
				if product.slug == productSlug:
					return True
			return False
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.product.ProductSlugAvailableApi post', e)
			raise InternalServerError
