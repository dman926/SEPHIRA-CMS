from fastapi import APIRouter
from config import APISettings

from fastapi import Depends, Body, Request
from typing import Optional
from pydantic import BaseModel, AnyHttpUrl
from mongoengine.errors import DoesNotExist

from modules.JWT import get_jwt_identity_optional
from database.models import Order
from resources.errors import NotFoundError, NotImplementedError

from coinbase_commerce.client import Client
from config import CoinbaseCommerceSettings

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
		
		# TODO: calculate order amount with a service. Use the flask price_service as a base and rework it.
		
		amount = 0
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
async def webhook(payload: dict = Body(...)):
	try:
		raise NotImplementedError
	except NotImplementedError:
		raise NotImplementedError().http_exception
	except Exception as e:
		raise e