'''
Order routes
'''

from flask import jsonify, request
from flask_restful_swagger_2 import Resource, swagger
from flask_jwt_extended import jwt_required, get_jwt_identity

from mongoengine.errors import FieldDoesNotExist, NotUniqueError, DoesNotExist, ValidationError, InvalidQueryError
from resources.errors import SchemaValidationError, InternalServerError, UnauthorizedError

from database.models import Order, CartItem, Product, Coupon
from services.logging_service import writeWarningToLog

class OrdersApi(Resource):
	@swagger.doc({
		'tags': ['Order'],
		'description': 'Get all orders of this user',
		'responses': {
			'200': {
				'description': 'Array of Orders',
			}
		}
	})
	@jwt_required()
	def get(self):
		try:
			orders = Order.objects(orderer=get_jwt_identity())
			mappedOrders = list(map(lambda o: o.serialize(), orders))
			return jsonify(mappedOrders)
		except DoesNotExist:
			return jsonify([])
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.order.OrdersApi get', e)
			raise InternalServerError
	@swagger.doc({
		'tags': ['Order'],
		'description': 'Add new order',
		'parameters': [
			{
				'name': 'products',
				'description': 'A list of CartItem',
				'in': 'body',
				'type': 'object',
				'schema': None,
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'Order added',
			}
		}
	})
	@jwt_required(optional=True)
	def post(self):
		try:
			body = request.get_json()
			items = body.get('products')
			couponItems = body.get('coupons')
			print(couponItems)
			products = []
			for item in items:
				product = Product.objects.get(id=item['id'])
				products.append(CartItem(product=product, qty=item['qty']))
			coupons = []
			for item in couponItems:
				coupon = Coupon.objects.get(id=item['id'])
				coupons.append(coupon)
			order = Order(orderer=get_jwt_identity(), orderStatus='not placed', addresses=body['addresses'], products=products, coupons=coupons)
			order.save()
			id = order.id
			return {'id': str(id)}, 200
		except (FieldDoesNotExist, ValidationError):
			raise SchemaValidationError
		except UnauthorizedError:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.order.OrdersApi post', e)
			raise InternalServerError


class OrderApi(Resource):
	@swagger.doc({
		'tags': ['Order'],
		'description': 'Get the order. Orders with non signed in users are only presented the order status for shipping concerns.',
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
				'description': 'The order',
			}
		}
	})
	@jwt_required(optional=True)
	def get(self, id):
		try:
			if (get_jwt_identity()):
				try:
					order = Order.objects.get(id=id, orderer=get_jwt_identity())
					return jsonify(order.serialize())
				except DoesNotExist:
					order = Order.objects.get(id=id)
					return { 'orderStatus': order.orderStatus }
				except Exception:
					raise InternalServerError		
			else:
				order = Order.objects.get(id=id)
				return { 'orderStatus': order.orderStatus }
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.order.OrderApi get', e)
			raise InternalServerError