'''
Menu Item routes
'''

from flask import jsonify, request
from flask_restful_swagger_2 import Resource, swagger

from resources.errors import InternalServerError

from database.models import MenuItem

from services.logging_service import writeWarningToLog

class MenuItemsApi(Resource):
	@swagger.doc({
		'tags': ['Menu Items'],
		'description': 'Get the dynamic menu items',
		'responses': {
			'200': {
				'description': 'The menu items'
			}
		}
	})
	def get(self):
		try:
			menuItems = MenuItem.objects()
			return jsonify(list(map(lambda mi: mi.serialize(), menuItems)))
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.menuItem.MenuItemsApi get', e)
			raise InternalServerError