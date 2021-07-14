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
			'id': str(self.id),
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

	# For orders
	price = db.DecimalField(precision=2)

	def serialize(self, order=False):
		if order:
			return {
				'id': str(self.product.id),
				'product': self.product.serialize(),
				'qty': self.qty,
				'price': float(self.price)
			}
		else:
			return {
				'id': str(self.product.id),
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
	stripeCustomerID = db.StringField()

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
			'id': str(self.id),
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
	digital = db.BooleanField(default=False)
	taxable = db.DictField()

	totalReviews = db.IntField(default=0)
	avgReviewScore = db.FloatField(default=0)

	def addReview(self, score):
		self.avgReviewScore = ((self.avgReviewScore * self.totalReviews) + int(score)) / (self.totalReviews + 1)
		self.totalReviews = self.totalReviews + 1

	def serialize(self):
		return {
			'id': str(self.id),
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
			"digital": self.digital,
			"taxable": self.taxable,
			'totalReviews': self.totalReviews,
			'avgReviewScore': round(self.avgReviewScore, 1) # Round to 1 decimal place
		}

class Order(db.Document):
	orderer = db.ReferenceField('User')
	orderStatus = db.StringField() # can be 'not placed', 'pending', 'paid', 'shipped', 'completed', 'failed'
	products = db.EmbeddedDocumentListField('CartItem')
	coupons = db.ListField(db.ReferenceField('Coupon'))
	taxRate = db.FloatField()
	addresses = db.DictField()
	paymentIntentID = db.StringField()
	paypalCaptureID = db.StringField()
	createdAt = db.DateTimeField(default=datetime.datetime.now)
	modified = db.DateTimeField(default=datetime.datetime.now)

	meta = {
		'indexes': [
			'orderer'
		]
	}

	def serialize(self):
		mappedProducts = list(map(lambda p: p.serialize(True), self.products))
		mappedCoupons = list(map(lambda c: c.serialize(), self.coupons))
		orderer = None
		if self.orderer:
			orderer = str(self.orderer.id)
		return {
			'id': str(self.id),
			'orderer': orderer,
			'orderStatus': self.orderStatus,
			'products': mappedProducts,
			'coupons': mappedCoupons,
			'taxRate': self.taxRate,
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
			'id': str(self.id),
			'reviewer': {
				'firstName': self.reviewer.firstName
			},
			'product': str(self.product.id),
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
			'id': str(self.id),
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

class UsTaxJurisdiction(db.Document):
	zip = db.StringField(primary_key=True)
	state = db.StringField()
	taxRegion = db.StringField()
	stateRate = db.FloatField()
	estimatedCombinedRate = db.FloatField()
	estimatedCountyRate = db.FloatField()
	estimatedCityRate = db.FloatField()
	estimatedSpecialRate = db.FloatField()
	riskLevel = db.IntField()

	meta = {
		'indexes': [
			'state'
		]
	}

	def serialize(self):
		return {
			'zip': self.zip,
			'state': self.state,
			'taxRegion': self.taxRegion,
			'stateRate': self.stateRate,
			'estimatedCombinedRate': self.estimatedCombinedRate,
			'estimatedCountyRate': self.estimatedCountyRate,
			'estimatedCityRate': self.estimatedCityRate,
			'estimatedSpecialRate': self.estimatedSpecialRate,
			'riskLevel': self.riskLevel
		}

class ShippingRate(db.EmbeddedDocument):
	rate = db.FloatField()
	type = db.StringField(choices=['dollar', 'percent'])
	minCutoff = db.FloatField()
	maxCutoff = db.FloatField()

	def serialize(self):
		return {
			'rate': self.rate,
			'type': self.type,
			'minCutoff': self.minCutoff,
			'maxCutoff': self.maxCutoff
		}

class UsShippingZone(db.Document):
	applicableStates = db.ListField(db.StringField(unique=True, choices=[
		"AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DC", "DE", "FL", "GA", 
		"HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", 
		"MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
		"NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", 
		"SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
	]))
	rates = db.EmbeddedDocumentListField('ShippingRate')

	def serialize(self):
		mappedRates = list(map(lambda r: r.serialize(), self.rates))
		return {
			'applicableStates': self.applicableStates,
			'rates': mappedRates
		}

User.register_delete_rule(Post, 'author', db.CASCADE)