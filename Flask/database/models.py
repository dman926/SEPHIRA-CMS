'''
Models to serialize between MongoDB and Python
'''

from .db import db
from flask_bcrypt import generate_password_hash, check_password_hash
import onetimepass

from services.util_service import make_ngrams

import base64, os, random, string, datetime

class Post(db.Document):
	author = db.ReferenceField('User')
	title = db.StringField()
	slug = db.StringField(unique_with='_cls')
	content = db.StringField()
	excerpt = db.StringField()
	status = db.StringField(choices=['publish', 'draft', 'private', 'deactivated'], default='draft')
	categories = db.ListField(db.StringField())
	
	categoriesPrefixNgrams = db.ListField(db.StringField())
	titleNgrams = db.StringField()
	titlePrefixNgrams = db.StringField()

	created = db.DateTimeField(default=datetime.datetime.now())
	modified = db.DateTimeField(default=datetime.datetime.now())

	meta = {
		'allow_inheritance': True,
		'indexes': [
			{
				'fields': ['$titleNgrams', '$titlePrefixNgrams', '$categoriesPrefixNgrams'],
				'default_language': 'english',
				'weights': { 'titleNgrams': 100, 'titlePrefixNgrams': 200, 'categoriesPrefixNgrams': 20 }
			}
		]
	}

	def generateNgrams(self):
		self.titleNgrams = u' '.join(make_ngrams(self.title.lower()))
		self.titlePrefixNgrams = u' '.join(make_ngrams(self.title.lower(), True))			
		self.categoriesPrefixNgrams = list(map(lambda c: u' '.join(make_ngrams(c.lower(), True)), self.categories))

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
			'categories': self.categories,
			'created': str(self.created),
			'modified': str(self.modified)
		}

class Page(Post):
	pass

class CartItem(db.EmbeddedDocument):
	product = db.ReferenceField('Product')
	qty = db.IntField()

	def serialize(self):
		return {
			'id': str(self.product.pk),
			'name': self.product.title,
			'price': float(self.product.price),
			'qty': self.qty
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

	cart = db.EmbeddedDocumentListField('CartItem')

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
			'lastName': self.lastName,

			'cart': list(map(lambda c: c.serialize(), self.cart))
		}

class Product(Post):
	sku = db.StringField()
	img = db.ListField(db.StringField())
	price = db.DecimalField(precision=2)

	totalReviews = db.IntField(default=0)
	avgReviewScore = db.FloatField(default=0)

	def addReview(self, score):
		self.avgReviewScore = ((self.avgReviewScore * self.totalReviews) + int(score)) / (self.totalReviews + 1)
		self.totalReviews = self.totalReviews + 1
		self.vendor.addReview(score)
		self.vendor.save()

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
			'categories': self.categories,
			'created': str(self.created),
			'modified': str(self.modified),
			'sku': self.sku,
			'img': self.img,
			'price': float(self.price),
			'totalReviews': self.totalReviews,
			'avgReviewScore': round(self.avgReviewScore, 1) # Round to 1 decimal place
		}

class Order(db.Document):
	orderer = db.ReferenceField('User')
	orderStatus = db.StringField() # can be 'not placed', 'pending', 'paid', 'shipped', 'completed', 'failed'
	products = db.EmbeddedDocumentListField('CartItem')
	coupons = db.ListField(db.ReferenceField('Coupon'))
	addresses = db.DictField()
	paymentIntentID = db.StringField()
	createdAt = db.DateTimeField(default=datetime.datetime.now)
	modified = db.DateTimeField(default=datetime.datetime.now)

	def serialize(self):
		mappedProducts = list(map(lambda p: p.serialize(), self.products))
		mappedCoupons = list(map(lambda c: c.serialize(), self.coupons))
		orderer = None
		if self.orderer:
			orderer = str(self.orderer.pk)
		return {
			'id': str(self.pk),
			'orderer': orderer,
			'orderStatus': self.orderStatus,
			'products': mappedProducts,
			'coupons': mappedCoupons,
			'addresses': self.addresses,
			'createdAt': str(self.createdAt)
		}

class Review(db.Document):
	reviewer = db.ReferenceField('User', unique_with='product', required=True) # 1 review per person per product
	product = db.ReferenceField('Product', required=True)
	score = db.DecimalField(precision=1, min_value=0, max_value=5, required=True)
	review = db.StringField()

	def serialize(self):
		return {
			'id': str(self.pk),
			'reviewer': {
				'firstName': self.reviewer.firstName
			},
			'product': str(self.product.pk),
			'score': float(self.score),
			'review': self.review
		}

class Coupon(Post):
	code = db.StringField()
	discountType = db.StringField() # Can be 'percent' or 'dollar'
	discount = db.FloatField()
	storeWide = db.BooleanField(default=False)
	applicableProducts = db.ListField(db.ReferenceField('Product'))
	uses = db.IntField(default=0)
	maxUses = db.IntField(default=-1)

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
			'categories': self.categories,
			'created': str(self.created),
			'modified': str(self.modified),
			'code': self.code,
			'discountType': self.discountType,
			'discount': self.discount,
			'storeWide': self.storeWide,
			'applicableProducts': list(map(lambda p: str(p.id), self.applicableProducts)),
			'uses': self.uses,
			'maxUses': self.maxUses,
			'created': str(self.created)
		}

User.register_delete_rule(Post, 'author', db.CASCADE)