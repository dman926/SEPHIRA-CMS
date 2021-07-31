'''
Order routes
'''

from flask import jsonify, request
from flask_restful_swagger_2 import Resource, swagger
from flask_jwt_extended import jwt_required, get_jwt_identity

from mongoengine.errors import FieldDoesNotExist, DoesNotExist, ValidationError
from resources.errors import SchemaValidationError, InternalServerError, UnauthorizedError

from database.models import Order, CartItem, Product, Coupon, UsTaxJurisdiction, UsShippingZone
from services.price_service import calculate_discount_price
from services.logging_service import writeWarningToLog

class OrdersApi(Resource):
	@swagger.doc({
		'tags': ['Order'],
		'description': 'Get all orders of this user according to pagination criteria',
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
				'description': 'Array of Orders',
			}
		}
	})
	@jwt_required()
	def get(self):
		try:
			orders = Order.objects(orderer=get_jwt_identity())
			total = orders.count()
			page = int(request.args.get('page', 0))
			size = int(request.args.get('size', total))
			orders = orders[page * size : page * size + size]			
			return jsonify({ 'total': total, 'orders': list(map(lambda o: o.serialize(), orders)) })
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
			products = []
			for p in body['products']:
				product = Product.objects.get(id=p['id'])
				products.append(CartItem(product=product, qty=p['qty'], price=product.price))
			order = Order(orderer=get_jwt_identity(), orderStatus='not placed', products=products)
			order.save()
			return str(order.id), 200
		except (FieldDoesNotExist, ValidationError, DoesNotExist):
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
				except DoesNotExist: # Shouldn't happed, but just in case
					order = Order.objects.get(id=id)
					return { 'orderStatus': order.orderStatus }
				except Exception as e:
					writeWarningToLog('Unhandled exception in resources.order.OrderApi get internal try/catch block', e)
					raise InternalServerError
			else:
				order = Order.objects.get(id=id)
				return { 'orderStatus': order.orderStatus }
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.order.OrderApi get', e)
			raise InternalServerError
	@swagger.doc({
		'tags': ['Order'],
		'description': 'Update the order addresses and/or coupons. Must be signed in as the orderer',
		'parameters': [
			{
				'name': 'id',
				'description': 'The item id',
				'in': 'path',
				'type': 'string',
				'required': True
			},
			{
				'name': 'addresses',
				'description': 'The addresses',
				'in': 'body',
				'type': 'object',
				'schema': None,
				'required': False
			},
			{
				'name': 'coupons',
				'description': 'The coupons',
				'in': 'body',
				'type': 'object',
				'schema': None,
				'required': False
			}
		],
		'responses': {
			'200': {
				'description': 'Order updated',
			}
		}
	})
	@jwt_required(optional=True)
	def put(self, id):
		try:
			body = request.get_json()
			order = Order.objects.get(id=id, orderer=get_jwt_identity())
			if (body.get('addresses')):
				taxJurisdiction = UsTaxJurisdiction.objects.get(zip=str(int(body['addresses']['shipping']['zip'])))
				shippingZone = None
				try:
					shippingZone = UsShippingZone.objects.get(applicableStates=body['addresses']['shipping']['region'])
				except DoesNotExist:
					shippingZone = UsShippingZone.objects.get(default=True)
				rateCandidates = []
				price = calculate_discount_price(order.products, order.coupons)
				for rate in shippingZone.rates:
					if ((rate.minCutoff != None and rate.minCutoff < price) or rate.minCutoff == None) and ((rate.maxCutoff != None and rate.maxCutoff > price) or rate.maxCutoff == None):
						rateCandidates.append(rate)
				match = None
				for candidate in rateCandidates:
					if match == None:
						match = candidate
					else:
						if match.minCutoff == None and candidate.minCutoff != None:
							match = candidate
						elif match.maxCutoff == None and candidate.maxCutoff != None:
							match = candidate
						elif match.matchCutoff - match.minCutoff > candidate.maxCutoff - candidate.minCutoff:
							match = candidate
				order.update(addresses=body['addresses'], taxRate=taxJurisdiction.estimatedCombinedRate, shippingType=match.type, shippnigRate=match.rate)
			if (body.get('coupons')):
				coupons = list(map(lambda c: Coupon.objects.get(id=c['id']), body['coupons']))
				order.update(coupons=coupons)
			return 'ok', 200
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.order.OrderApi put', e)
			raise InternalServerError()