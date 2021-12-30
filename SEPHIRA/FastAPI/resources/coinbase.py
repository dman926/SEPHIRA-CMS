from fastapi import APIRouter
from config import APISettings

from fastapi import Depends, Body, Header
from typing import Optional
from pydantic import BaseModel, AnyHttpUrl
from mongoengine.errors import DoesNotExist

from modules.JWT import get_jwt_identity_optional
from database.models import Order
from resources.errors import NotFoundError, NotImplementedError, OutOfStockError, UnauthorizedError
from services import price_service

from coinbase_commerce.client import Client
from coinbase_commerce.error import WebhookInvalidPayload, SignatureVerificationError
from coinbase_commerce.webhook import Webhook
from config import CoinbaseCommerceSettings

from json import dumps

router = APIRouter(
	prefix=APISettings.ROUTE_BASE + 'payment/coinbase',
	tags=['Payment', 'Coinbase']
)

###########
# HELPERS #
###########

ccClient = Client(api_key=CoinbaseCommerceSettings.API_KEY)

###########
# SCHEMAS #
###########

class CoinbaseCheckoutBody(BaseModel):
	orderID: str
	location: AnyHttpUrl

##########
# ROUTES #
##########

@router.post('/checkout')
async def coinbase_checkout(body: CoinbaseCheckoutBody, identity: Optional[str] = Depends(get_jwt_identity_optional)):
	try:
		order = Order.objects.get(id=body.orderID, orderer=identity)
		amount = price_service.calculate_order_total(order)
		charge_info = {
			'name': CoinbaseCommerceSettings.CHARGE_NAME,
			'description': CoinbaseCommerceSettings.CHARGE_DESCRIPTION,
			'local_price': {
				'amount': amount,
				'currency': 'USD'
			},
			'pricing_type': 'fixed_price',
			'redirect_url': body['location'] + '/store/checkout/placed?clear=1?id=' + str(order.id),
			'cancel_url': body['location'] + '/store/checkout',
			'metadata': {
				'order': str(order.id)
			}
		}
		charge = ccClient.charge.create(**charge_info)

		return {
			'expires_at': charge['expires_at'],
			'hosted_url': charge['hosted_url'],
			'logo_url': charge['logo_url']
		}
	except DoesNotExist:
		raise NotFoundError().http_exception
	except Exception as e:
		raise e

@router.post('/webhook')
async def webhook(payload: dict = Body(...), X_CC_Webhook_Signature: str = Header(None), User_Agent: str = Header(None)):
	try:
		if User_Agent != 'weipay-webhooks':
			raise UnauthorizedError
		try:
			event = Webhook.construct_event(dumps(payload).encode(), X_CC_Webhook_Signature, CoinbaseCommerceSettings.SHARED_SECRET)
		except (WebhookInvalidPayload, SignatureVerificationError):
			raise UnauthorizedError
		
		order = Order(id=event.data.metadata.order)
		if event.type == 'charge:pending':
			order.orderStatus = 'placed'
			order.save()
			price_service.remove_stock(order)
		elif event.type == 'charge:confirmed':
			order.orderStatus = 'paid'
			order.save()
		elif event.type == 'charge:failed':
			order.orderStatus = 'failed'
			order.save()
			price_service.add_stock(order)
		return 'ok'
	except UnauthorizedError:
		raise UnauthorizedError().http_exception
	except Exception as e:
		raise e