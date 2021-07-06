'''
Cart operation routes
'''

from flask import jsonify, request
from flask_restful_swagger_2 import Resource, swagger
from flask_jwt_extended import jwt_required, get_jwt_identity

from mongoengine.errors import DoesNotExist
from resources.errors import InternalServerError

from database.models import User, Product, Coupon

from services.logging_service import writeWarningToLog

class CartApi(Resource):
	'''
	Get the current user's cart
	'''
	@swagger.doc({
		'tags': ['Cart'],
		'description': 'Get the current user\'s cart',
		'responses': {
			'200': {
				'description': 'The users cart',
			}
		}
	})
	@jwt_required()
	def get(self):
		try:
			user = User.objects.get(id=get_jwt_identity())
			products = list(map(lambda p: p.serialize(), user.cart))
			return jsonify(products)
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.cart.CartApi get: ' + str(e))
			raise InternalServerError
	@swagger.doc({
		'tags': ['Cart'],
		'description': 'Update the current user\'s cart',
		'parameters': [
			{
				'name': 'cart',
				'description': 'An array of CartItem',
				'in': 'body',
				'type': 'object',
				'schema': None,
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'Cart updated',
			}
		}
	})
	@jwt_required()
	def put(self):
		try:
			user = User.objects.get(id=get_jwt_identity())
			pairs = request.get_json()
			cart = [None] * len(pairs)
			for i in range(0, len(pairs)):
				product = Product.objects.get(id=pairs[i]['id'])
				qty = pairs[i]['qty']
				cart[i] = {
					'product': product,
					'qty': qty
				}
			user.update(cart=cart)
			user.save()
			return 'ok', 200
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.cart.CartApi put: ' + str(e))
			raise InternalServerError

class CouponCheckApi(Resource):
	@swagger.doc({
		'tags': ['Coupon'],
		'description': 'Check if the coupon is valid',
		'parameters': [
			{
				'name': 'code',
				'description': 'The coupon code',
				'in': 'body',
				'type': 'string',
				'schema': None,
				'required': True
			},
			{
				'name': 'cart',
				'description': 'An array of CartItem',
				'in': 'body',
				'type': 'object',
				'schema': None,
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'The coupon objects that are valid',
			}
		}
	})
	def post(self):
		try:
			body = request.get_json()
			code = body.get('code')
			cart = body.get('cart')
			coupon = Coupon.objects.get(code=code)
			if coupon.storeWide:
				return jsonify(coupon.serialize())
			if coupon.maxUses != -1 and coupon.maxUses < coupon.uses:
				return False
			else:
				for item in cart:
					try:
						product = Product.objects.get(id=item['id'])
						if product in coupon.applicableProducts:
							return jsonify(coupon.serialize())
					except Exception:
						continue
				return False
		except DoesNotExist:
			return False
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.cart.CouponCheckApi post: ' + str(e))
			raise InternalServerError