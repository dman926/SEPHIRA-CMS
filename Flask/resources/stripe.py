'''
Stripe routes
'''

from flask import jsonify, request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity

from resources.errors import InternalServerError

from database.models import Product

from resources.utils import calculate_order_amount

import json
import os

import stripe

class PaymentIntentApi(Resource):
	'''
	Create payment intent
	'''
	def post(self):
		try:
			data = json.loads(request.data)
			if not data:
				return ''
			intent = stripe.PaymentIntent.create(
				amount=calculate_order_amount(data),
				currency='usd'
				# TODO: description
			)
			return jsonify({
				'clientSecret': intent['client_secret']
			})
		except Exception:
			raise InternalServerError

class StripeApi(Resource):
	def post(self):
		payload = request.get_json()
		event = None

		try:
			event = stripe.Event.construct_from(
				payload, stripe.api_key
			)
		except ValueError:
			return '', 400

		if event.type == 'payment_intent.succeeded':
			payment_intent = event.data.object # contains a stripe.PaymentIntent
			# Then define and call a method to handle the successful payment intent.
			# handle_payment_intent_succeeded(payment_intent)
		elif event.type == 'payment_method.attached':
			payment_method = event.data.object # contains a stripe.PaymentMethod
			# Then define and call a method to handle the successful attachment of a PaymentMethod.
			# handle_payment_method_attached(payment_method)
			# ... handle other event types
		else:
			print('Unhandled event type {}'.format(event.type))

		return 'ok', 200