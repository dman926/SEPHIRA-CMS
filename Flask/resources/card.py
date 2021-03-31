'''
Movie routes
'''

from flask import jsonify, request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity

from mongoengine.errors import FieldDoesNotExist, NotUniqueError, DoesNotExist, ValidationError, InvalidQueryError
from resources.errors import SchemaValidationError, InternalServerError

from database.models import Card, User

class CardsApi(Resource):
	'''
	Get all cards owned by this user
	'''
	@jwt_required()
	def get(self):
		cards = Card.objects(owner=get_jwt_identity())
		return jsonify(cards)
	'''
	Add new card
	'''
	@jwt_required()
	def post(self):
		try:
			user_id = get_jwt_identity()
			body = request.get_json()
			user = User.objects.get(id=user_id)
			card =  Card(**body, owner=user)
			card.save()
			user.update(push__cards=card)
			user.save()
			id = card.id
			return {'id': str(id)}, 200
		except (FieldDoesNotExist, ValidationError):
			raise SchemaValidationError
		except Exception:
			raise InternalServerError


class CardApi(Resource):
	'''
	Update card
	'''
	@jwt_required()
	def put(self, id):
		try:
			user_id = get_jwt_identity()
			card = Card.objects.get(id=id, owner=user_id)
			body = request.get_json()
			card.update(**body)
			return 'ok', 200
		except InvalidQueryError:
			raise SchemaValidationError
		except DoesNotExist:
			raise UpdatingMovieError
		except Exception:
			raise InternalServerError       
	'''
	Delete card
	'''
	@jwt_required()
	def delete(self, id):
		try:
			user_id = get_jwt_identity()
			card = Card.objects.get(id=id, owner=user_id)
			card.delete()
			return 'ok', 200
		except DoesNotExist:
			raise DeletingMovieError
		except Exception:
			raise InternalServerError