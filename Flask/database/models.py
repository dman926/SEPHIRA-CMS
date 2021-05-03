'''
Models to serialize between MongoDB and Python
'''

from .db import db
from flask_bcrypt import generate_password_hash, check_password_hash

import random, string

class Card(db.Document):
	name = db.StringField()
	content = db.StringField()
	width = db.IntField()
	height = db.IntField()
	owner = db.ReferenceField('User')

	def serialize(self):
		return {
			'id': str(self.pk),
			'name': self.name,
			'content': self.content,
			'width': self.width,
			'height': self.height
		}

class User(db.Document):
	email = db.EmailField(required=True, unique=True)
	password = db.StringField(required=True, min_length=6)
	salt = db.StringField()
	admin = db.BooleanField()
	cards = db.ListField(db.ReferenceField('Card', reverse_delete_rule=db.PULL))

	def hash_password(self):
		chars = string.ascii_letters + string.punctuation
		size = 12
		self.salt = ''.join(random.choice(chars) for x in range(size))
		self.password = generate_password_hash(self.password + self.salt).decode('utf8')

	def check_password(self, password):
		return check_password_hash(self.password, password + self.salt)

	def serialize(self):
		mappedCards = list(map(lambda c: c.serialize(), self.cards))
		return {
			'id': str(self.pk),
			'email': self.email,
			'admin': self.admin,
			'cards': mappedCards
		}

User.register_delete_rule(Card, 'owner', db.CASCADE)