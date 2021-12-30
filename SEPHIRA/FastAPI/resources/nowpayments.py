from fastapi import APIRouter
from config import APISettings, ShopSettings, NowPaymentsSettings, AngularSettings

from fastapi import Depends, Body, Header
from typing import Literal, Optional
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
import os

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

def coinInCachedCoins(coin: str) -> bool:
	for cachedCoin in cachedAvailableCoins:
		if cachedCoin['coin'] == coin:
			return True
	return False

async def setCachedAvailableCoins() -> None:
	global cachedAvailableCoins
	r = await http_service.request('GET', nowPaymentsApiBase + 'currencies', headers=nowpayments_auth_headers)
	if r.status_code == 200:
		crypto_logos = os.listdir(os.path.join(AngularSettings.ASSET_PATH, 'img', 'crypto_logos'))
		def mapCrypto(coin: str):
			ext = None
			for i in range(len(crypto_logos)):
				splitCrypto = crypto_logos[i].rsplit('.', 1)
				if splitCrypto[0] == coin:
					ext = splitCrypto[1]
					crypto_logos.pop(i) # Remove from array to make further searches faster
					break
			return { 'coin': coin, 'ext': ext }
		cachedAvailableCoins = list(map(mapCrypto, r.json()['currencies']))
		return True
	return False

###########
# SCHEMAS #
###########

class CheckoutBody(BaseModel):
	orderID: str
	coin: Optional[str] = None
	case: Optional[Literal['success', 'fail', 'partially_paid']] = None
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
				if not await setCachedAvailableCoins():
					raise ServiceUnavailableError
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
		if not coinInCachedCoins(coin.lower()):
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
		if not coinInCachedCoins(coin.lower()):
			raise NotFoundError
		currencyTo = NowPaymentsSettings.DEFAULT_CURRENCY_OUTPUT_CODE.lower()
		if coin in list(map(lambda c: c.lower(), NowPaymentsSettings.DEFINED_WALLETS)):
			currencyTo = coin
		payload = {
			'currency_from': currencyTo,
			'currency_to': coin,
			'fiat_equivalent': ShopSettings.CURRENCY_CODE.lower()
		}
		r = await http_service.request('GET', nowPaymentsApiBase + 'min-amount', params=payload, headers=nowpayments_auth_headers)
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
		if not checkout_body.coin or not coinInCachedCoins(checkout_body.coin.lower()):
			raise SchemaValidationError
		order = Order.objects.get(id=checkout_body.orderID, orderer=identity)
		# TODO: calculate price
		price = 5
		payload = {
			'price_amount': price,
			'price_currency': ShopSettings.CURRENCY_CODE.lower(),
			'pay_currency': checkout_body.coin.lower(),
			'ipn_callback_url': APISettings.DOMAIN + APISettings.ROUTE_BASE + 'payment/nowpayments/webhook',
			'order_id': str(order.id)
		}
		if NowPaymentsSettings.SANDBOX and checkout_body.case:
			payload['case'] = checkout_body.case
		headers = nowpayments_auth_headers | { 'Content-Type': 'application/json' }
		r = await http_service.request('POST', nowPaymentsApiBase + 'payment', json=payload, headers=headers)
		print(r.json())
		if r.status_code == 200:
			j = r.json()
			order.gatewayPaymentID = j['payment_id']
			order.save()
			return {
				'pay_addresss': j['pay_address'],
				'pay_amount': j['pay_amount'],
				'pay_currency': j['pay_currency'],
				'created_at': j['created_at']
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

@router.post('/invoice-checkout')
async def checkout(checkout_body: CheckoutBody, identity: str = Depends(get_jwt_identity_optional)):
	try:
		if not checkout_body.location:
			raise SchemaValidationError
		order = Order.objects.get(id=checkout_body.orderID, orderer=identity)
		# TODO: calculate price
		price = 5
		payload = {
			'price_amount': price,
			'price_currency': ShopSettings.CURRENCY_CODE.lower(),
			'ipn_callback_url': APISettings.DOMAIN + APISettings.ROUTE_BASE + 'payment/nowpayments/webhook',
			'order_id': str(order.id),
			'redirect_url': checkout_body.location + '/store/checkout/placed?clear=1?id=' + str(order.id),
			'cancel_url': checkout_body.location + '/store/checkout',
		}
		if checkout_body.coin and coinInCachedCoins(checkout_body.coin.lower()):
			payload['pay_currency'] = checkout_body.coin.lower()
		r = await http_service.request('POST', nowPaymentsApiBase + 'invoice', json=payload, headers=nowpayments_auth_headers)
		if r.status_code == 200:
			j = r.json()
			order.gatewayPaymentID = j['payment_id']
			order.save()
			return {
				'invoice_url': j['invoice_url'],
				'created_at': j['created_at']
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