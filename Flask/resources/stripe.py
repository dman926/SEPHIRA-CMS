'''
Stripe routes
'''

from flask import jsonify, request
from flask_restful_swagger_2 import Resource, swagger
from flask_jwt_extended import jwt_required, get_jwt_identity
from stripe.api_resources import payment_method

from mongoengine.errors import DoesNotExist
from resources.errors import InternalServerError, UnauthorizedError, SchemaValidationError

from database.models import Order, User, CartItem, Coupon

from app import socketio
from services.price_service import calculate_order_amount, calculate_discount_price
from services.logging_service import writeWarningToLog

import json
import os

import stripe

class StripeCheckoutApi(Resource):
	@jwt_required(optional=True)
	def post(self):
		try:
			body = request.get_json()
			order = Order.objects.get(id=body['orderID'], orderer=get_jwt_identity())
			paymentMethodID = body['paymentMethodID']
			shipping = order.addresses['shipping']
			shipping = {
				'address': {
					'line1': shipping['street1'],
					'city': shipping['city'],
					'country': shipping['country'],
					'line2': shipping['street2'],
					'postal_code': shipping['zip'],
					'state': shipping['region']
				},
				'name': shipping['name'],
				'phone': shipping['phoneNumber']
			}
			email = body['email']
			amount = calculate_discount_price(order.products, order.coupons)
			amount = round(amount * 100) # Convert for stripe
			intent = None
			if get_jwt_identity():
				user = User.objects.get(id=get_jwt_identity())
				cust = None
				if user.stripeCustomerID:
					cust = stripe.Customer.retrieve(user.stripeCustomerID)
				else:
					cust = stripe.Customer.create(
						email=email,
						shipping=shipping,
						phone=order.addresses['billing']['phoneNumber'],
						name=order.addresses['billing']['name']
					)
					user.stripeCustomerID = cust['id']
					user.save()
				intent = stripe.PaymentIntent.create(
					amount=amount,
					currency='usd',
					customer=cust['id'],
					confirm=True,
					payment_method=paymentMethodID,
					shipping=shipping,
					metadata={order: str(order.pk)}
				)
			else:
				intent = stripe.PaymentIntent.create(
					amount=amount,
					currency='usd',
					confirm=True,
					payment_method=paymentMethodID,
					shipping=shipping,
					metadata={order: str(order.pk)}
				)
			order.paymentIntentID = intent['id']
			order.orderStatus = 'placed'
			order.save()
			return str(order.id)
		except DoesNotExist:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.stripe.CheckoutPaymentApi post: ' + str(e))
			raise InternalServerError

class StripeApi(Resource):
	@swagger.doc({
		'tags': ['Stripe'],
		'description': 'Stripe webhook endpoint. Do not use.',
		'responses': {
			'200': {
				'description': 'always'
			}
		}
	})
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
			# TODO: attach card to customer object
			payment_intent = event.data.object # contains a stripe.PaymentIntent
			order = Order(id=payment_intent['metadata']['Order object'])
			order.orderStatus = 'paid'
			order.save()
			socketio.emit('order ' + str(order.pk), order.orderStatus, namespace='/')
		elif event.type == 'payment_intent.failed':
			payment_intent = event.data.object # contains a stripe.PaymentIntent
			order = Order(id=payment_intent['metadata']['Order object'])
			order.orderStatus = 'failed'
			order.save()
			socketio.emit('order ' + str(order.pk), order.orderStatus, namespace='/')
		elif event.type == 'invoice.paid':
			# TODO: create order with details
			pass
		elif event.type == 'invoice.payment_failed':
			# TODO: create order with details
			pass
		else:
			writeWarningToLog('Unhandled Stripe webhook event type {}'.format(event.type))
			print('Unhandled Strip webhook event type {}'.format(event.type))
			return 'ok', 200

		return 'ok', 200