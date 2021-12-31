from fastapi import APIRouter
from mongoengine.errors import DoesNotExist
from config import APISettings, StripeSettings

import stripe
from fastapi import Body, Depends
from typing import Optional
from pydantic import BaseModel, EmailStr
from modules.JWT import get_jwt_identity_optional
from database.models import Order, User
from resources.errors import NotFoundError, OutOfStockError
from services import price_service

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
	addresses: dict

##########
# ROUTES #
##########

@router.post('/checkout')
async def stripe_checkout(checkout_body: CheckoutModel, identity: Optional[str] = Depends(get_jwt_identity_optional)):
	try:
		order = Order.objects.get(id=checkout_body.orderID, orderer=identity)
		order.addresses = checkout_body.addresses

		if not price_service.remove_stock(order):
			raise OutOfStockError
		
		order.stockRemoved = True
		order.save()

		shipping = checkout_body.addresses['shipping']
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
		amount = price_service.calculate_order_total(order)
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
	except DoesNotExist:
		raise NotFoundError().http_exception
	except OutOfStockError:
		raise OutOfStockError().http_exception
	except Exception as e:
		raise e

@router.post('/webhook')
async def webhook(payload: dict = Body(...)):
	try:
		event = None

		try:
			event = stripe.Event.construct_from(
				payload, stripe.api_key
			)
		except ValueError:
			return '', 400

		payment_intent = event.data.object # contains a stripe.PaymentIntent
		order = Order.objects.get(id=payment_intent['metadata']['Order object'])
		if event.type == 'payment_intent.succeeded':
			order.orderStatus = 'paid'
		elif event.type == 'payment_intent.failed':
			order.orderStatus = 'failed'
			if order.stockRemoved:
				price_service.add_stock(order)
				order.stockRemoved = False
		elif event.type == 'invoice.paid':
			# TODO: create order with details
			pass
		elif event.type == 'invoice.payment_failed':
			# TODO: create order with details
			pass
		else:
			print('Unhandled Strip webhook event type {}'.format(event.type))
			return 'ok', 200

		order.save()
		return 'ok', 200
	except DoesNotExist:
		raise NotFoundError().http_exception
	except Exception as e:
		raise e