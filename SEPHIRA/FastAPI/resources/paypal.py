from fastapi import APIRouter
from fastapi.param_functions import Body
from config import APISettings, PayPalSettings

from typing import Optional
from pydantic import BaseModel, AnyHttpUrl
from fastapi import Depends, Header
from paypalcheckoutsdk.core import PayPalHttpClient, SandboxEnvironment, LiveEnvironment
from paypalcheckoutsdk.orders import OrdersCreateRequest, OrdersCaptureRequest, OrdersGetRequest
from modules.JWT import get_jwt_identity_optional
from mongoengine.errors import DoesNotExist
from resources.errors import NotFoundError, OutOfStockError, ServiceUnavailableError, UnauthorizedError
from database.models import Order
from services import price_service, http_service
from binascii import crc32
import os
import json
from cryptography import x509
from cryptography.hazmat import backends
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding

router = APIRouter(
	prefix=APISettings.ROUTE_BASE + 'payment/paypal',
	tags=['Payment', 'PayPal']
)

###########
# HELPERS #
###########

class PayPalClient:
	def __init__(self):
		if PayPalSettings.USE_SANDBOX:
			self.environment = SandboxEnvironment(client_id=PayPalSettings.CLIENT_ID, client_secret=PayPalSettings.CLIENT_SECRET)
		else:
			self.environment = LiveEnvironment(client_id=PayPalSettings.CLIENT_ID, client_secret=PayPalSettings.CLIENT_SECRET)
		self.client = PayPalHttpClient(self.environment)

paypal_client = PayPalClient()

async def getPayPalCert(url: str) -> Optional[str]:
	certPath = os.path.join('cache', 'paypal_cert.json')
	if os.path.exists(certPath):
		with open(certPath, 'w') as certFile:
			return json.loads(certFile)['cert']
	r = await http_service.request('GET', url)
	if r.status_code == 200:
		if not os.path.exists('cache'):
			os.mkdir('cache')
		with open(certPath, 'w') as certFile:
			json.dumps({
				'url': url,
				'cert': r.text
			}, certFile)
		return r.text
	return

###########
# SCHEMAS #
###########

class CreateTransactionModel(BaseModel):
	orderID: str
	location: AnyHttpUrl

class CaptureTransactionModel(BaseModel):
	orderID: str

##########
# ROUTES #
##########

@router.post('/checkout')
async def create_transaction(transaction_body: CreateTransactionModel, identity: Optional[str] = Depends(get_jwt_identity_optional)):
	try:
		order = Order.objects.get(id=transaction_body.orderID, orderer=identity)
		shipping = order.addresses['shipping']
		shipping = {
			"method": "United States Postal Service", # TODO: make this dynamic
			"address": {
				"name": {
					"full_name": shipping['name']
				},
				"address_line_1": shipping['street1'],
				"address_line_2": shipping['street2'],
				"admin_area_2": shipping['city'],
				"admin_area_1": shipping['region'],
				"postal_code": shipping['zip'],
				"country_code": shipping['country']
			}
		}
		base_amount = price_service.calculate_order_subtotal(order)
		tax = price_service.calculate_order_tax(order)
		amount = base_amount + tax
		shippingAmt = price_service.calculate_order_shipping(order)
		total = amount + shippingAmt
		discount = price_service.calculate_order_discount(order)
		
		requestBody = {
			"intent": "CAPTURE",
			"application_context": {
				"brand_name": PayPalSettings.BRAND_NAME,
				"landing_page": 'BILLING',
				"shipping_preference": "SET_PROVIDED_ADDRESS",
				"user_action": "PAY_NOW",
				"return_url": transaction_body.location + "/checkout/placed?id=" + str(order.id),
				"cancel_url": transaction_body.location + "/checkout",
			},
			"purchase_units": [
				{
#					"reference_id": "",
#					"description": "",
					"custom_id": str(order.id),
#					"soft_descriptor": "",
					"amount": {
					"currency_code": "USD",
						"value": '{:.2f}'.format(round(amount, 2)),
						"breakdown": {
							"item_total": {
								"currency_code": "USD",
								"value": '{:.2f}'.format(round(total, 2))
							},
							"shipping": {
								"currency_code": "USD",
								"value": '{:.2f}'.format(round(shippingAmt, 2))
							},
							"tax_total": {
								"currency_code": "USD",
								"value": '{:.2f}'.format(round(tax, 2))
							},
							"discount": {
								"currency_code": "USD",
								"value": '{:.2f}'.format(round(discount, 2))
							}
						}
					},
					"items": [],
					"shipping": shipping
				}
			]
		}
		for item in order.products:
			requestBody['purchase_units'][0]['items'].append({
				"name": item.product.title,
				"unit_amount": {
					"currency_code": "USD",
					"value": '{:.2f}'.format(float(item.product.price))
				},
				"tax": {
					"currency_code": "USD",
					"value": '{:.2f}'.format(float(item.product.price) * order.taxRate)
				},
				"quantity": str(item.qty),
				"description": item.product.excerpt,
				"sku": item.product.sku,
				"category": "DIGITAL_GOODS" if item.product.digital else "PHYSICAL_GOODS"
			})
		requestArgs = OrdersCreateRequest()
		requestArgs.prefer('return=representation')
		requestArgs.request_body(requestBody)
		response = paypal_client.client.execute(requestArgs)
		return response.result.id
	except DoesNotExist:
		raise NotFoundError().http_exception
	except Exception as e:
		raise e

@router.post('/capture')
async def capture_transaction(transaction_body: CaptureTransactionModel, identity: Optional[str] = Depends(get_jwt_identity_optional)):
	try:
		orderResponse = paypal_client.client.execute(OrdersGetRequest(transaction_body.orderID))
		order = Order.objects.get(id=orderResponse.result.purchase_units[0].custom_id)
		if not price_service.remove_stock(order):
			raise OutOfStockError
		response = paypal_client.client.execute(OrdersCaptureRequest(transaction_body.orderID))
		order.paypalCaptureID = response.result.purchase_units[0].payments.captures[0].id
		order.orderStatus = 'placed'
		order.save()
		return orderResponse.result.purchase_units[0].custom_id
	except OutOfStockError:
		raise OutOfStockError().http_exception
	except Exception as e:
		raise e

@router.post('/webhook')
async def webhook(payload: dict = Body(...), PAYPAL_TRANSMISSION_ID: str = Header(None), PAYPAL_TRANSMISSION_TIME: str = Header(None),  PAYPAL_TRANSMISSION_SIG: str = Header(None), PAYPAL_AUTH_ALGO: str = Header(None), PAYPAL_CERT_URL: str = Header(None)):
	try:
		# Verify signature
		cert = await getPayPalCert(PAYPAL_CERT_URL)
		if not cert:
			raise ServiceUnavailableError
		signature = f'{PAYPAL_TRANSMISSION_ID}|{PAYPAL_TRANSMISSION_TIME}|{PayPalSettings.WEBHOOK_ID}|{crc32(bytes(payload))}'
		cert = x509.load_pem_x509_certificate(cert.encode('ascii'), backend=backends.default_backend())
		public_key = cert.public_key()
		try:
			public_key.verify(
				PAYPAL_TRANSMISSION_SIG,
				signature,
				padding.PKCS1v15(),
				hashes.SHA256()
			)
		except Exception:
			raise UnauthorizedError
		# Signature verification complete

		if payload['event_type'] == 'CHECKOUT.ORDER.COMPLETED':
			pass

		return 'ok'
	except ServiceUnavailableError:
		raise ServiceUnavailableError().http_exception
	except UnauthorizedError:
		raise UnauthorizedError().http_exception
	except Exception as e:
		raise e