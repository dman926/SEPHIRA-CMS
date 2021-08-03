'''
PayPal routes
'''

from flask import jsonify, request
from flask_restful_swagger_2 import Resource, swagger
from flask_jwt_extended import jwt_required, get_jwt_identity

from mongoengine.errors import DoesNotExist
from resources.errors import UnauthorizedError, InternalServerError, OutOfStockError

from database.models import Order

from app import paypal_client
from paypalcheckoutsdk.orders import OrdersCreateRequest, OrdersCaptureRequest, OrdersGetRequest

from services.logging_service import writeWarningToLog
from services.price_service import calculate_order_amount, calculate_discount_price, check_stock, remove_stock, add_stock

class PayPalCreateTransactionApi(Resource):
	@jwt_required(optional=True)
	def post(self):
		try:
			body = request.get_json()
			order = Order.objects.get(id=body['orderID'], orderer=get_jwt_identity())
			location = body['location']
			shipping = order.addresses['shipping']
			shipping = {
				"method": "United States Postal Service",
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
			total = calculate_discount_price(order.products, order.coupons)
			discount = calculate_order_amount(order.products) - total
			base_amount = total - discount
			tax = base_amount * order.taxRate
			amount = base_amount + tax
			shippingAmt = 0
			if order.shippingType == 'dollar':
				amount += order.shippingRate
				shippingAmt = order.shippingRate
			elif order.shippingType == 'percent':
				amount += amount * order.shippingRate
				shippingAmt = amount * order.shippingRate
			requestBody = {
				"intent": "CAPTURE",
				"application_context": {
					"brand_name": "brand inc", # TODO: Change this
					"landing_page": 'BILLING',
					"shipping_preference": "SET_PROVIDED_ADDRESS",
					"user_action": "PAY_NOW",
					"return_url": location + "/checkout/placed?id=" + str(order.id),
					"cancel_url": location + "/checkout",
				},
				"purchase_units": [
					{
#						"reference_id": "",
#						"description": "",
						"custom_id": str(order.id),
#						"soft_descriptor": "",
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
			response = paypal_client.execute(requestArgs)
			return jsonify(response.result.id)
		except DoesNotExist:
			raise UnauthorizedError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.paypal.PayPalCreateTransactionApi post', str(e))
			raise InternalServerError

class PayPalCaptureTransactionApi(Resource):
	@jwt_required(optional=True)
	def post(self):
		orderID = request.get_json()['orderID']
		orderResponse = paypal_client.execute(OrdersGetRequest(orderID))
		print(orderResponse)
		order = Order.objects.get(id=orderResponse.result.purchase_units[0].custom_id)
		if not remove_stock(order.products):
			raise OutOfStockError
		response = paypal_client.execute(OrdersCaptureRequest(orderID))
		order.paypalCaptureID = response.result.purchase_units[0].payments.captures[0].id
		order.orderStatus = 'placed'
		order.save()
		return jsonify(orderResponse.result.purchase_units[0].custom_id)

class PayPalApi(Resource):
	@swagger.doc({
		'tags': ['PayPal'],
		'description': 'PayPal webhook endpoint. Do not use.',
		'responses': {
			'200': {
				'description': 'always'
			}
		}
	})
	def post(self):
		payload = request.get_json()
		
		if payload['event_type'] == 'CHECKOUT.ORDER.COMPLETED':
			pass
		# TODO

		return 'ok', 200