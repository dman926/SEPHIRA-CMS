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
from config import CoinbaseCommerceSettings, ShopSettings

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
				'currency': ShopSettings.CURRENCY_CODE.upper()
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
		
		order = Order.objects.get(id=event.data.metadata.order)
		if event.type == 'charge:pending':
			if not order.stockRemoved:
				if price_service.remove_stock(order):
					order.orderStatus = 'placed'
					order.stockRemoved = True
				else:
					order.orderStatus = 'to refund'
		elif event.type == 'charge:confirmed':
			order.orderStatus = 'paid'
		elif event.type == 'charge:failed':
			order.orderStatus = 'failed'
			if order.stockRemoved:
				price_service.add_stock(order)
				order.stockRemoved = False
		elif event.type == 'charge:delayed':
			order.status = 'to refund'
			# TODO: send an email to the user that they payed after expiratin, that the order failed, and they will be refunded (minus transaction fees perhaps)
		order.save()
		return 'ok'
	except UnauthorizedError:
		raise UnauthorizedError().http_exception
	except Exception as e:
		raise e