'''
Post routes
'''

from flask import jsonify, request
from flask_restful_swagger_2 import Resource, swagger
from flask_jwt_extended import jwt_required

from mongoengine.errors import DoesNotExist
from resources.errors import ResourceNotFoundError, InternalServerError

from database.models import Post

from services.logging_service import writeWarningToLog

class PostsApi(Resource):
	@swagger.doc({
		'tags': ['Post'],
		'description': 'Get all posts according to pagination criteria',
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
			page = int(request.args.get('page', 0))
			size = int(request.args.get('size', 0))
			posts = Post.objects()[page * size : page * size + size]
			return jsonify(list(map(lambda p: p.serialize(), posts)))
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.post.PostsApi get', e)
			raise InternalServerError

class PostApi(Resource):
	@swagger.doc({
		'tags': ['Post'],
		'description': 'Get the post with associated slug',
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
				'description': 'A Post',
			}
		}
	})
	def get(self):
		try:
			post = Post.objects.get(slug=request.args.get('slug'))
			return jsonify(post.serialize())
		except DoesNotExist:
			raise ResourceNotFoundError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.post.PostsApi get', e)
			raise InternalServerError