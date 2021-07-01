'''
Post routes
'''

from flask import jsonify, request
from flask_restful_swagger_2 import Resource, swagger
from flask_jwt_extended import jwt_required

from database.models import Post

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
	@jwt_required()
	def get(self):
		page = int(request.args.get('page', 0))
		size = int(request.args.get('size', 0))
		posts = Post.objects()[page * size : page * size + size]
		return jsonify(list(map(lambda p: p.serialize(), posts)))