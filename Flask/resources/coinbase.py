from flask import jsonify, request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity

from coinbase_commerce.error import WebhookInvalidPayload, SignatureVerificationError
from coinbase_commerce.webhook import Webhook

from resources.utils import calculate_order_amount

import json

from app import ccClient
from secret import coinbase_commerce_shared_secret

class CoinbaseChargeApi(Resource):
	@jwt_required(optional=True)
	def post(self):
		data = json.loads(request.data)
		if not data:
			return ''
		price = calculate_order_amount(data) / 100
		
		charge_info = {
			'name': 'Test Charge',
			'description': 'Test Description',
			'local_price': {
				'amount': price,
				'currency': 'USD'
			},
			'pricing_type': 'fixed_price',
			#'redirect_url': '',
			'metadata': {
				'user': str(get_jwt_identity())
			}
		}
		charge = ccClient.charge.create(**charge_info)
		return jsonify(charge)

class CoinbaseWebhookApi(Resource):
	def post(self):
		payload = request.data.decode('utf-8')
		signature = request.headers.get('X-CC-Webhook-Signature')

		try:
			event = Webhook.construct_event(payload, signature, coinbase_commerce_shared_secret)
		except (WebhookInvalidPayload, SignatureVerificationError) as e:
			return str(e), 400
		
		print('Received event: id={id}, type={type}'.format(id=event.id, type=event.type))

		if event.type == 'charge:pending':
			# TODO: set the order to pending
			pass
		elif event.type == 'charge:confirmed':
			# TODO: set the order to confirmed
			pass
		elif event.type == 'charge:failed':
			# TODO: set the order to failed
			pass

		return 'ok', 200