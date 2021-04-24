'''
Cart operation routes
'''

from flask import jsonify, request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity

from mongoengine.errors import FieldDoesNotExist, NotUniqueError, DoesNotExist, ValidationError, InvalidQueryError
from resources.errors import SchemaValidationError, InternalServerError, UnauthorizedError

from database.models import User, Product, CartItem



class CartApi(Resource):
	'''
	Get the current user's cart
	'''
	@jwt_required()
	def get(self):
		user = User.objects.get(id=get_jwt_identity())
		products = list(map(lambda p: p.serialize(), user.cart))
		return jsonify(products)
	'''
	Update the current user's cart
	'''
	@jwt_required()
	def put(self):
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