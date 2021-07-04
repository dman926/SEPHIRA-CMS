'''
PayPal routes
'''

from flask import jsonify, request
from flask_restful_swagger_2 import Resource, swagger
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import paypal_client
from paypalcheckoutsdk.orders import OrdersCreateRequest

class PayPalPaymentApi(Resource):
	@jwt_required(optional=True)
	def post(self):
		try:
			body = request.get_json()
			paymentMethodID = body['paymentMethodID']
			shipping = body['addresses']['shipping']
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
			products = list(map(lambda p: CartItem(product=p['id'], qty=p['qty']), body['products']))
			coupons = list(map(lambda c: Coupon.objects.get(id=c['id']), body['coupons']))
			order = Order(orderer=get_jwt_identity(), orderStatus='not placed', products=products, coupons=coupons, addresses=body['addresses'])
			order.save()
			amount = calculate_discount_price(order.products, order.coupons)
			amount = round(amount * 100.0) / 100.0
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
					transfer_group=str(order.pk),
					metadata={order: str(order.pk)}
				)
			else:
				intent = stripe.PaymentIntent.create(
					amount=amount,
					currency='usd',
					confirm=True,
					payment_method=paymentMethodID,
					shipping=shipping,
					transfer_group=str(order.pk),
					metadata={order: str(order.pk)}
				)
			order.paymentIntentID = intent['id']
			order.save()
			return str(order.id)
		except DoesNotExist:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.stripe.CheckoutPaymentApi post: ' + str(e))
			raise InternalServerError

class PayPalApi(Resource):
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
		elif event.type == 'customer.subscription.deleted':
			# Vendor subscription has ended and isn't renewed.
			# Delete from User document
			User.objects.get(stripeSubscriptionID=event.data['id'])
			user.update(unset__stripeSubscriptionID)
		else:
			writeWarningToLog('Unhandled Stripe webhook event type {}'.format(event.type))
			print('Unhandled Strip webhook event type {}'.format(event.type))
			return 'ok', 200

		return 'ok', 200