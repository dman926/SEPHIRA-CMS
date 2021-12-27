from fastapi import APIRouter
from config import APISettings, ShopSettings, NowPaymentsSettings

from fastapi import Depends
from typing import Optional
from pydantic import BaseModel, AnyHttpUrl
from mongoengine.errors import DoesNotExist

from modules.JWT import get_jwt_identity_optional
from database.models import Order
from resources.errors import NotFoundError, ServiceUnavailableError
from services import http_service

from datetime import datetime, timedelta

router = APIRouter(
	prefix=APISettings.ROUTE_BASE + 'payment/nowpayments',
	tags=['Payment', 'NOWPayments']
)

###########
# HELPERS #
###########

nowpayments_auth_headers = { 'x-api-key': NowPaymentsSettings.API_KEY }
lastPingPong = datetime.now() - timedelta(seconds=NowPaymentsSettings.STATUS_PING_TIME - 1) # Used to limit how often nowpayments is pinged on it's current status. Default is this way to get the first request to always ping-pong
nowPaymentStatus = False
cachedAvailableCoins = []

###########
# SCHEMAS #
###########



##########
# ROUTES #
##########

@router.get('/available-coins')
async def get_coins():
	global lastPingPong, nowPaymentStatus, cachedAvailableCoins
	try:
		newPingPongTime = datetime.now()
		if lastPingPong + timedelta(seconds=NowPaymentsSettings.STATUS_PING_TIME) < newPingPongTime:
			nowPaymentStatus = (await http_service.request('GET', 'https://api.nowpayments.io/v1/status')).status_code == 200
			if nowPaymentStatus:
				lastPingPong = newPingPongTime
				cachedAvailableCoins = (await http_service.request('GET', 'https://api.nowpayments.io/v1/currencies', headers=nowpayments_auth_headers)).json()['currencies']
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
		r = await http_service.request('GET', 'https://api.nowpayments.io/v1/estimate', params = { 'amount': amount, 'currency_from': ShopSettings.CURRENCY_CODE.lower(), 'currency_to': coin }, headers=nowpayments_auth_headers)
		if r.status_code == 200:
			return r.json()['estimated_amount']
		raise ServiceUnavailableError
	except ServiceUnavailableError:
		raise ServiceUnavailableError().http_exception
	except NotFoundError:
		raise NotFoundError().http_exception
	except Exception as e:
		raise e