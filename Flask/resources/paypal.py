'''
PayPal routes
'''

from flask import jsonify, request
from flask_restful_swagger_2 import Resource, swagger
from flask_jwt_extended import jwt_required, get_jwt_identity

from mongoengine.errors import DoesNotExist
from resources.errors import UnauthorizedError, InternalServerError

from database.models import CartItem, Order

from app import paypal_client
from paypalcheckoutsdk.orders import OrdersCreateRequest, OrdersCaptureRequest, OrdersGetRequest

from services.logging_service import writeWarningToLog
from services.price_service import calculate_order_amount, calculate_discount_price

from pprint import pprint

class PayPalCreateTransactionApi(Resource):
	@jwt_required(optional=True)
	def post(self):
		try:
			body = request.get_json()
			location = body['location']
			shipping = body['addresses']['shipping']
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
			products = list(map(lambda p: CartItem(product=p['id'], qty=p['qty']), body['products']))
			coupons = list(map(lambda c: Coupon.objects.get(id=c['id']), body['coupons']))
			order = Order(orderer=get_jwt_identity(), orderStatus='not placed', products=products, coupons=coupons, addresses=body['addresses'])
			order.save()
			total = calculate_discount_price(order.products, order.coupons)
			discount = calculate_order_amount(order.products) - total
			amount = total - discount
			requestBody = {
				"intent": "CAPTURE",
				"application_context": {
					"brand_name": "brand inc", # TODO: Change this
					"landing_page": 'BILLING',
					"shipping_preference": "SET_PROVIDED_ADDRESS",
					"user_action": "PAY_NOW",
					"return_url": location + "/checkout/placed?id=" + str(order.id), # TODO: Change this
					"cancel_url": location + "/checkout", # TODO: Change this
				},
				"purchase_units": [
					{
#						"reference_id": "",
#						"description": "",
						"custom_id": str(order.id),
#						"soft_descriptor": "",
						"amount": {
							"currency_code": "USD",
							"value": '{:.2f}'.format(round(total, 2)),
							"breakdown": {
								"item_total": {
									"currency_code": "USD",
									"value": '{:.2f}'.format(round(amount, 2))
								},
								"shipping": {
									"currency_code": "USD",
									"value": '{:.2f}'.format(round(0, 2)) # TODO
								},
								"tax_total": {
									"currency_code": "USD",
									"value": '{:.2f}'.format(round(0, 2)) # TODO
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
						"value": str(item.product.price)
					},
					"tax": {
						"currency_code": "USD",
						"value": 0 # TODO
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
			writeWarningToLog('Unhandled exception in resources.stripe.CheckoutPaymentApi post', str(e))
			raise InternalServerError

class PayPalCaptureTransactionApi(Resource):
	@jwt_required(optional=True)
	def post(self):
		orderID = request.get_json()['orderID']
		response = paypal_client.execute(OrdersCaptureRequest(orderID))
		orderResponse = paypal_client.execute(OrdersGetRequest(orderID))
		order = Order.objects.get(id=orderResponse.result.purchase_units[0].custom_id)
		order.paypalCaptureID = response.result.purchase_units[0].payments.captures[0].id
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
		
		# TODO

		return 'ok', 200