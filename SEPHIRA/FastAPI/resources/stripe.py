from fastapi import APIRouter
from config import APISettings, StripeSettings

import stripe
from fastapi import Body, Depends
from typing import Optional
from pydantic import BaseModel, EmailStr
from modules.JWT import get_jwt_identity_optional
from database.models import Order, User

router = APIRouter(
	prefix=APISettings.ROUTE_BASE + 'payment/stripe',
	tags=['Payment', 'Stripe']
)

stripe.api_key = StripeSettings.SECRET_KEY

###########
# SCHEMAS #
###########

class CheckoutModel(BaseModel):
	orderID: str
	paymentMethodID: str
	email: EmailStr

##########
# ROUTES #
##########

@router.post('/checkout')
async def stripe_checkout(checkout_body: CheckoutModel, identity: Optional[str] = Depends(get_jwt_identity_optional)):
	try:
		order = Order.objects.get(id=checkout_body.orderID, orderer=identity)
		
		# TODO
		#if not remove_stock(order.products):
		#	raise OutOfStockError
		
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
		# TODO: amount = calculate_discount_price(order.products, order.coupons)
		amount = 0
		amount += amount * order.taxRate
		if order.shippingType == 'dollar':
			amount += order.shippingRate
		elif order.shippingType == 'percent':
			amount += amount * order.shippingRate
		amount = round(amount * 100) # Convert for stripe
		intent = None
		if identity:
			user = User.objects.get(id=identity)
			cust = None
			if user.stripeCustomerID:
				cust = stripe.Customer.retrieve(user.stripeCustomerID)
			else:
				cust = stripe.Customer.create(
					email=checkout_body.email,
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
				payment_method=checkout_body.paymentMethodID,
				shipping=shipping,
				metadata={order: str(order.pk)}
			)
		else:
			intent = stripe.PaymentIntent.create(
				amount=amount,
				currency='usd',
				confirm=True,
				payment_method=checkout_body.paymentMethodID,
				shipping=shipping,
				metadata={order: str(order.pk)}
			)
		order.paymentIntentID = intent['id']
		order.orderStatus = 'placed'
		order.save()

		return str(order.id)
	except Exception as e:
		raise e

@router.post('/webhook')
async def webhook(payload: dict = Body(..., embed=True)):
	try:
		event = None

		try:
			event = stripe.Event.construct_from(
				payload, stripe.api_key
			)
		except ValueError:
			return '', 400

		if event.type == 'payment_intent.succeeded':
			payment_intent = event.data.object # contains a stripe.PaymentIntent
			order = Order(id=payment_intent['metadata']['Order object'])
			order.orderStatus = 'paid'
			order.save()
			# TODO
			# socketio.emit('order ' + str(order.pk), order.orderStatus, namespace='/')
		elif event.type == 'payment_intent.failed':
			payment_intent = event.data.object # contains a stripe.PaymentIntent
			order = Order(id=payment_intent['metadata']['Order object'])
			order.orderStatus = 'failed'
			order.save()
			# TODO
			# add_stock(order.products)
			# socketio.emit('order ' + str(order.pk), order.orderStatus, namespace='/')
		elif event.type == 'invoice.paid':
			# TODO: create order with details
			pass
		elif event.type == 'invoice.payment_failed':
			# TODO: create order with details
			pass
		else:
			print('Unhandled Strip webhook event type {}'.format(event.type))
			return 'ok', 200

		return 'ok', 200
	except Exception as e:
		raise e