'''
Coinbase Endpoints
'''

from flask import jsonify, request
from flask_restful_swagger_2 import Resource, swagger
from flask_jwt_extended import jwt_required, get_jwt_identity

from coinbase_commerce.error import WebhookInvalidPayload, SignatureVerificationError
from coinbase_commerce.webhook import Webhook

from database.models import Order

from app import socketio
from services.price_service import calculate_discount_price

import json

from app import ccClient
from secret import coinbase_commerce_shared_secret

class CoinbaseCheckoutApi(Resource):
	@swagger.doc({
		'tags': ['Payment', 'Coinbase Commerce'],
		'description': 'Get the coinbase commerce intent for the hosted_url',
		'responses': {
			'200': {
				'description': 'The coinbase commerce intent',
			}
		}
	})
	@jwt_required(optional=True)
	def post(self):
		body = request.get_json()
		order = Order.objects.get(id=body['orderID'], orderer=get_jwt_identity())
		amount = calculate_discount_price(order.products, order.coupons)
		charge_info = {
			'name': 'Test Charge', # TODO: Change this
			'description': 'Test Description', # TODO: Change this
			'local_price': {
				'amount': amount,
				'currency': 'USD'
			},
			'pricing_type': 'fixed_price',
			'redirect_url': body['location'] + '/checkout/placed?id=' + str(order.id),
			'metadata': {
				'order': str(order.id)
			}
		}
		charge = ccClient.charge.create(**charge_info)
		return jsonify({ 'expires_at': charge['expires_at'], 'hosted_url': charge['hosted_url'] })

class CoinbaseApi(Resource):
	@swagger.doc({
		'tags': ['Coinbase Commerce'],
		'description': 'Coinbase Commerce webhook endpoint. Do not use.',
		'responses': {
			'200': {
				'description': 'always'
			}
		}
	})
	def post(self):
		payload = request.data.decode('utf-8')
		signature = request.headers.get('X-CC-Webhook-Signature')

		try:
			event = Webhook.construct_event(payload, signature, coinbase_commerce_shared_secret)
		except (WebhookInvalidPayload, SignatureVerificationError) as e:
			return str(e), 400
		
		print('Received event: id={id}, type={type}'.format(id=event.id, type=event.type))

		if event.type == 'charge:pending':
			order = Order(id=event.data.metadata.order)
			order.orderStatus = 'pending'
			order.save()
		elif event.type == 'charge:confirmed':
			order = Order(id=event.data.metadata.order)
			order.orderStatus = 'paid'
			order.save()
		elif event.type == 'charge:failed':
			order = Order(id=event.data.metadata.order)
			order.orderStatus = 'failed'
			order.save()
		else:
			return 'ok', 200

		socketio.emit('order ' + str(order.pk), order.orderStatus)

		return 'ok', 200