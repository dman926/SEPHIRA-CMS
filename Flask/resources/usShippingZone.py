'''
US Shipping Zone routes
'''

from flask import jsonify, request
from flask_restful_swagger_2 import Resource, swagger

from mongoengine.errors import DoesNotExist
from resources.errors import InternalServerError, ResourceNotFoundError

from database.models import UsShippingZone

from services.logging_service import writeWarningToLog

class UsShippingZoneApi(Resource):
	@swagger.doc({
		'tags': ['Shipping'],
		'description': 'Get the shipping rates for the given state code',
		'parameters': [
			{
				'name': 'state',
				'description': 'The requested state code',
				'in': 'query',
				'type': 'string',
				'schema': None,
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'The shipping rates'
			}
		}
	})
	def get(self):
		try:
			shippingZone = UsShippingZone.objects.get(applicableStates=request.args['state']) # strip leading 0s if present
			return jsonify(shippingZone.serialize())
		except DoesNotExist:
			raise ResourceNotFoundError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.usShippingZone.UsShippingZoneApi get', e)
			raise InternalServerError