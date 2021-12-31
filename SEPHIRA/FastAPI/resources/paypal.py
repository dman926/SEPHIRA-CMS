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
from resources.errors import NotFoundError, OutOfStockError
from database.models import Order
from services import price_service

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
async def webhook(payload: dict = Body(...), PAYPAL_TRANSMISSION_SIG: str = Header(None), PAYPAL_AUTH_ALGO: str = Header(None), PAYPAL_CERT_URL: str = Header(None)):
	try:
		# TODO
		if payload['event_type'] == 'CHECKOUT.ORDER.COMPLETED':
			pass

		return 'ok'
	except Exception as e:
		raise e