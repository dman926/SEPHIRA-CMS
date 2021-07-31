'''
Post routes
'''

from flask import jsonify, request
from flask_restful_swagger_2 import Resource, swagger

from mongoengine.errors import DoesNotExist
from resources.errors import ResourceNotFoundError, InternalServerError

from database.models import Page

from services.logging_service import writeWarningToLog

class PagesApi(Resource):
	@swagger.doc({
		'tags': ['Page'],
		'description': 'Get all pages according to pagination criteria',
		'parameters': [
			{
				'name': 'page',
				'description': 'The index page',
				'in': 'query',
				'type': 'int',
				'required': False
			},
			{
				'name': 'size',
				'description': 'The page size',
				'in': 'query',
				'type': 'int',
				'required': False
			},
			{
				'name': 'search',
				'description': 'The search term',
				'in': 'query',
				'type': 'string',
				'schema': None,
				'required': False
			}
		],
		'responses': {
			'200': {
				'description': 'Array of Post',
			}
		}
	})
	def get(self):
		try:
			search = request.args.get('search')
			pages = Page.objects()
			if search:
				pages = pages.search_text(search).order_by('$text_score')
			total = pages.count()
			page = int(request.args.get('page', 0))
			size = int(request.args.get('size', total))
			pages = pages[page * size : page * size + size]
			return jsonify({ 'total': total, 'pages': list(map(lambda p: p.serialize(), pages)) })
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.page.PagesApi get', e)
			raise InternalServerError

class PageApi(Resource):
	@swagger.doc({
		'tags': ['Page'],
		'description': 'Get the page with associated slug',
		'parameters': [
			{
				'name': 'slug',
				'description': 'The page slug',
				'in': 'query',
				'type': 'string',
				'required': True
			}
		],
		'responses': {
			'200': {
				'description': 'A Page',
			}
		}
	})
	def get(self):
		try:
			page = Page.objects.get(slug=request.args.get('slug'))
			return jsonify(page.serialize())
		except DoesNotExist:
			raise ResourceNotFoundError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.page.PageApi get', e)
			raise InternalServerError