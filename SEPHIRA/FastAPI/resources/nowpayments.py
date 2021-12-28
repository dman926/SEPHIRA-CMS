from fastapi import APIRouter
from config import APISettings, ShopSettings, NowPaymentsSettings

from fastapi import Depends, Body, Header
from typing import Optional
from pydantic import BaseModel, HttpUrl
from mongoengine.errors import DoesNotExist

from modules.JWT import get_jwt_identity_optional
from database.models import Order
from resources.errors import NotFoundError, SchemaValidationError, ServiceUnavailableError, UnauthorizedError
from services import http_service

from datetime import datetime, timedelta
from json import dumps
import hmac
from hashlib import sha256

router = APIRouter(
	prefix=APISettings.ROUTE_BASE + 'payment/nowpayments',
	tags=['Payment', 'NOWPayments']
)

###########
# HELPERS #
###########

if NowPaymentsSettings.SANDBOX:
	nowPaymentsApiBase = 'https://api.sandbox.nowpayments.io/v1/'
else:
	nowPaymentsApiBase = 'https://api.nowpayments.io/v1/'
nowpayments_auth_headers = { 'x-api-key': NowPaymentsSettings.API_KEY }
lastPingPong = datetime.now() - timedelta(seconds=NowPaymentsSettings.STATUS_PING_TIME - 1) # Used to limit how often nowpayments is pinged on it's current status. Default is this way to get the first request to always ping-pong
nowPaymentStatus = False
cachedAvailableCoins = []

###########
# SCHEMAS #
###########

class CheckoutBody(BaseModel):
	orderID: str
	location: Optional[HttpUrl] = None

##########
# ROUTES #
##########

@router.get('/available-coins')
async def get_coins():
	global lastPingPong, nowPaymentStatus, cachedAvailableCoins
	try:
		newPingPongTime = datetime.now()
		if lastPingPong + timedelta(seconds=NowPaymentsSettings.STATUS_PING_TIME) < newPingPongTime:
			nowPaymentStatus = (await http_service.request('GET', nowPaymentsApiBase + 'status')).status_code == 200
			if nowPaymentStatus:
				lastPingPong = newPingPongTime
				cachedAvailableCoins = (await http_service.request('GET', nowPaymentsApiBase + 'currencies', headers=nowpayments_auth_headers)).json()['currencies']
		if not nowPaymentStatus:
			raise ServiceUnavailableError
		return cachedAvailableCoins
	except ServiceUnavailableError:
		raise ServiceUnavailableError().http_exception
	except Exception as e:
		raise e

@router.get('/estimated-amount')
async def estimated_price(coin: str, amount: float):
	try:
		if coin not in cachedAvailableCoins:
			raise NotFoundError
		payload = {
			'amount': amount,
			'currency_from': ShopSettings.CURRENCY_CODE.lower(),
			'currency_to': coin
		}
		r = await http_service.request('GET', nowPaymentsApiBase + 'estimate', params=payload, headers=nowpayments_auth_headers)
		if r.status_code == 200:
			return r.json()['estimated_amount']
		raise ServiceUnavailableError
	except ServiceUnavailableError:
		raise ServiceUnavailableError().http_exception
	except NotFoundError:
		raise NotFoundError().http_exception
	except Exception as e:
		raise e

@router.get('/min-amount')
async def min_amount(coin: str):
	try:
		if coin not in cachedAvailableCoins:
			raise NotFoundError
		currencyTo = NowPaymentsSettings.DEFAULT_CURRENCY_OUTPUT_CODE.lower()
		if coin in list(map(lambda c: c.lower(), NowPaymentsSettings.DEFINED_WALLETS)):
			currencyTo = coin
		r = await http_service.request('GET', nowPaymentsApiBase + 'min-amount', params={ 'currency_from': coin, 'currency_to': currencyTo }, headers=nowpayments_auth_headers)
		if r.status_code == 200:
			out = r.json()
			return {
				'min_amount': out['min_amount'],
				'fiat_equivalent': out['fiat_equivalent']
			}
		raise ServiceUnavailableError
	except ServiceUnavailableError:
		raise ServiceUnavailableError().http_exception
	except NotFoundError:
		raise NotFoundError().http_exception
	except Exception as e:
		raise e

@router.post('/payment-checkout')
async def checkout(checkout_body: CheckoutBody, identity: str = Depends(get_jwt_identity_optional)):
	try:
		order = Order.objects.get(id=checkout_body.orderID, orderer=identity)
		# TODO: calculate price
		price = 0
		payload = {
			'price_amount': price,
			'price_currency': ShopSettings.CURRENCY_CODE.lower(),
			'pay_currency': '',
			'ipn_callback_url': APISettings.DOMAIN + APISettings.ROUTE_BASE + 'payment/nowpayments/webhook',
			'order_id': str(order.id)
		}
		headers = nowpayments_auth_headers | { 'Content-Type': 'application/json' }
		r = await http_service.request('POST', nowPaymentsApiBase + 'payment', json=payload, headers=headers)
		if r.status_code == 200:
			j = r.json()
			order.gatewayPaymentID = j['payment_id']
			return 'ok'
		raise ServiceUnavailableError
	except DoesNotExist:
		raise NotFoundError().http_exception
	except ServiceUnavailableError:
		raise ServiceUnavailableError().http_exception
	except Exception as e:
		raise e

@router.post('/invoice-checkout')
async def checkout(checkout_body: CheckoutBody, identity: str = Depends(get_jwt_identity_optional)):
	try:
		if not checkout_body.location:
			raise SchemaValidationError
		order = Order.objects.get(id=checkout_body.orderID, orderer=identity)
		# TODO: calculate price
		price = 0
		payload = {
			'price_amount': price,
			'price_currency': ShopSettings.CURRENCY_CODE.lower(),
			'ipn_callback_url': APISettings.DOMAIN + APISettings.ROUTE_BASE + 'payment/nowpayments/webhook',
			'order_id': str(order.id),
			'redirect_url': checkout_body.location + '/store/checkout/placed?clear=1?id=' + str(order.id),
			'cancel_url': checkout_body.location + '/store/checkout',
		}
		r = await http_service.request('POST', nowPaymentsApiBase + 'invoice', json=payload, headers=nowpayments_auth_headers)
		if r.status_code == 200:
			j = r.json()
			order.gatewayPaymentID = j['payment_id']
			order.save()
			return {
				'invoice_url': j['invoice_url']
			}
		raise ServiceUnavailableError
	except SchemaValidationError:
		raise SchemaValidationError().http_exception
	except DoesNotExist:
		raise NotFoundError().http_exception
	except ServiceUnavailableError:
		raise ServiceUnavailableError().http_exception
	except Exception as e:
		raise e

@router.post('/webhook')
async def webhook(payload: dict = Body(...), x_nowpayments_sig: str = Header(None)):
	try:
		if not x_nowpayments_sig:
			raise SchemaValidationError
		payloadSignature = hmac.new(bytes(NowPaymentsSettings.IPN_SECRET, 'UTF-8'), dumps(sorted(payload.keys())).encode(), sha256).hexdigest()
		if payloadSignature != x_nowpayments_sig:
			raise UnauthorizedError
		order = Order.objects.get(id=payload['order_id'])
		status = payload['payment_status']
		if status == 'confirming':
			order.orderStatus = 'pending'
		elif status == 'confirmed':
			order.orderStatus = 'placed'
		elif status == 'partially_paid':
			order.orderStatus = 'partially paid'
		elif status == 'failed':
			order.orderStatus = 'failed'
		elif status == 'expired':
			if NowPaymentsSettings.DELETE_EXPIRED_ORDERS:
				order.delete()
				return 'ok'
		elif status == 'refunded':
			order.orderStatus = 'refunded'
		order.save()
		return 'ok'
	except SchemaValidationError:
		raise SchemaValidationError().http_exception
	except UnauthorizedError:
		raise UnauthorizedError().http_exception
	except DoesNotExist:
		raise NotFoundError().http_exception
	except Exception as e:
		raise e