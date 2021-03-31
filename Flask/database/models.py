'''
Models to serialize between MongoDB and Python
'''

from .db import db
from flask_bcrypt import generate_password_hash, check_password_hash

class Card(db.Document):
	name = db.StringField()
	content = db.StringField()
	width = db.IntField()
	height = db.IntField()
	owner = db.ReferenceField('User')

class User(db.Document):
	email = db.EmailField(required=True, unique=True)
	password = db.StringField(required=True, min_length=6)
	admin = db.BooleanField()
	cards = db.ListField(db.ReferenceField('Card', reverse_delete_rule=db.PULL))

	def hash_password(self):
		self.password = generate_password_hash(self.password).decode('utf8')

	def check_password(self, password):
		return check_password_hash(self.password, password)

User.register_delete_rule(Card, 'owner', db.CASCADE)