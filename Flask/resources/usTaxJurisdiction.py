'''
US Tax Jurisdiction routes
'''

from flask import jsonify, request
from flask_restful_swagger_2 import Resource, swagger

from mongoengine.errors import DoesNotExist
from resources.errors import InternalServerError, ResourceNotFoundError

from database.models import UsTaxJurisdiction

from services.logging_service import writeWarningToLog

class UsTaxJurisdictionApi(Resource):
	@swagger.doc({
		'tags': ['Tax'],
		'description': 'Get the tax rates for the given ZIP',
		'parameters': [
			{
				'name': 'zip',
				'description': 'The requested ZIP',
				'in': 'query',
				'type': 'string',
				'schema': None,
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'The tax rates'
			}
		}
	})
	def get(self):
		try:
			taxJurisdiction = UsTaxJurisdiction.objects.get(zip=request.args['zip'])
			return jsonify(taxJurisdiction.serialize())
		except DoesNotExist:
			raise ResourceNotFoundError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.usTaxJurisdiction.UsTaxJurisdictionAPI get', e)
			raise InternalServerError