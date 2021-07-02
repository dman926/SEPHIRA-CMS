'''
Models to serialize between MongoDB and Python
'''

from .db import db
from flask_bcrypt import generate_password_hash, check_password_hash

import onetimepass

import base64, os, random, string, datetime

class Post(db.Document):
	author = db.ReferenceField('User')
	title = db.StringField()
	slug = db.StringField(unique=True)
	content = db.StringField()
	excerpt = db.StringField()
	status = db.StringField()
	
	created = db.DateTimeField(default=datetime.datetime.now())
	modified = db.DateTimeField(default=datetime.datetime.now())

	def serialize(self):
		return {
			'id': str(self.pk),
			'author': {
				'id': str(self.author.id),
				'firstName': self.author.firstName,
				'lastName': self.author.lastName
			},
			'title': self.title,
			'slug': self.slug,
			'content': self.content,
			'excerpt': self.excerpt,
			'status': self.status,
			'created': str(self.created),
			'modified': str(self.modified)
		}

class User(db.Document):
	email = db.EmailField(required=True, unique=True)
	password = db.StringField(required=True, min_length=6)
	salt = db.StringField()
	otpSecret = db.StringField()
	twoFactorEnabled = db.BooleanField()
	admin = db.BooleanField()
	firstName = db.StringField()
	lastName = db.StringField()

	def hash_password(self):
		chars = string.ascii_letters + string.punctuation
		size = 12
		self.salt = ''.join(random.choice(chars) for x in range(size))
		self.password = generate_password_hash(self.password + self.salt).decode('utf8')
		if self.otpSecret is None:
			self.otpSecret = base64.b32encode(os.urandom(10)).decode('utf8')

	def check_password(self, password):
		return check_password_hash(self.password, password + self.salt)

	def get_totp_uri(self):
		return 'otpauth://totp/Flask-API:{0}?secret={1}&issuer=Flask-API' \
			.format(self.email, self.otpSecret)

	def verify_totp(self, token):
		return onetimepass.valid_totp(token, self.otpSecret)

	def serialize(self):
		return {
			'id': str(self.pk),
			'email': self.email,
			'twoFactorEnabled': self.twoFactorEnabled,
			'admin': self.admin,
			'firstName': self.firstName,
			'lastName': self.lastName
		}

User.register_delete_rule(Post, 'author', db.CASCADE)