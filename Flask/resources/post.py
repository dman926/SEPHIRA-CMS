'''
Post routes
'''

from flask import jsonify, request
from flask_restful_swagger_2 import Resource, swagger

from mongoengine.errors import DoesNotExist
from resources.errors import ResourceNotFoundError, InternalServerError, SchemaValidationError, InvalidPostTypeError

import database.models as models

from services.logging_service import writeWarningToLog

class PostsApi(Resource):
	@swagger.doc({
		'tags': ['Post'],
		'description': 'Get all posts according to pagination and search criteria',
		'parameters': [
			{
				'name': 'post',
				'description': 'The post type',
				'in': 'query',
				'type': 'string',
				'required': True
			},
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
			postType = request.args.get('post', None)
			if not postType:
				raise SchemaValidationError
			try:
				postType = eval(postType)
			except Exception:
				raise InvalidPostTypeError
			search = request.args.get('search')
			posts = postType.objects()
			if search:
				posts = posts.search_text(search).order_by('$text_score')
			page = int(request.args.get('page', 0))
			size = int(request.args.get('size', posts.count()))
			return jsonify({ 'total': posts.count(), 'posts': list(map(lambda p: p.serialize(), posts[page * size : page * size + size])) })
		except SchemaValidationError:
			raise SchemaValidationError
		except InvalidPostTypeError:
			raise InvalidPostTypeError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.post.PostsApi get', e)
			raise InternalServerError

class PostApi(Resource):
	@swagger.doc({
		'tags': ['Post'],
		'description': 'Get the post with given ID',
		'parameters': [
			{
				'name': 'post',
				'description': 'The post type',
				'in': 'query',
				'type': 'string',
				'required': False
			},
			{
				'name': 'id',
				'description': 'The post ID',
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
			postType = request.args.get('post', None)
			if not postType:
				raise SchemaValidationError
			try:
				postType = eval(postType)
			except Exception:
				raise InvalidPostTypeError
			post = postType.objects.get(id=request.args.get('id'))
			return jsonify(post.serialize())
		except DoesNotExist:
			raise ResourceNotFoundError
		except SchemaValidationError:
			raise SchemaValidationError
		except InvalidPostTypeError:
			raise InvalidPostTypeError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.post.PostApi get', e)
			raise InternalServerError

class PostSlugApi(Resource):
	@swagger.doc({
		'tags': ['Post'],
		'description': 'Get the post with associated slug',
		'parameters': [
			{
				'name': 'post',
				'description': 'The post type',
				'in': 'query',
				'type': 'string',
				'required': False
			},
			{
				'name': 'slug',
				'description': 'The post slug',
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
			postType = request.args.get('post', None)
			if not postType:
				raise SchemaValidationError
			try:
				postType = eval(postType)
			except Exception:
				raise InvalidPostTypeError
			post = postType.objects.get(slug=request.args.get('slug'))
			return jsonify(post.serialize())
		except DoesNotExist:
			raise ResourceNotFoundError
		except SchemaValidationError:
			raise SchemaValidationError
		except InvalidPostTypeError:
			raise InvalidPostTypeError
		except Exception as e:
			writeWarningToLog('Unhandled exception in resources.post.PostSlugApi get', e)
			raise InternalServerError