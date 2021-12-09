'''
Models to serialize between MongoDB and Python
'''

# to make the recursive MenuItemModel work
from __future__ import annotations
from typing import List

from typing import Optional
from mongoengine import Document, EmbeddedDocument, EmbeddedDocumentListField, ReferenceField, StringField, ListField, IntField, DateTimeField, BooleanField, EmailField, DecimalField, FloatField, DictField, CASCADE
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
import onetimepass

from services.util_service import make_ngrams

import random, string, datetime, re

###########
# HELPERS #
###########

_bcrypt = CryptContext(schemes=['bcrypt'])

###########
# SCHEMAS #
###########

class ProductModel(BaseModel):
	sku: Optional[str] = None
	img: Optional[list[str]] = []
	price: Optional[float] = None
	digital: Optional[bool] = None
	taxable: Optional[bool] = None
	hasStock: Optional[bool] = None
	stock: Optional[int] = None

class CartItemIDModel(BaseModel):
	id: str
	qty: int

class CartItemModel(BaseModel):
	product: ProductModel
	qty: int

class UserModel(BaseModel):
	email: Optional[EmailStr] = None
	password: Optional[str] = None
	twoFactorEnabled: Optional[bool] = None
	admin: Optional[bool] = None
	firstName: Optional[str] = None
	lastName: Optional[str] = None
	cart: Optional[list[CartItemModel]] = None

class OrderModel(BaseModel):
	addresses: Optional[dict] = None
	coupons: Optional[list[str]] = None

class ShippingRateModel(BaseModel):
	rate: float
	type: str
	minCutoff: Optional[float] = None
	maxCutoff: Optional[float] = None

class UsShippingZoneModel(BaseModel):
	applicableState: list[str] = []
	rate: list[ShippingRateModel] = []
	default: Optional[bool] = None

class MenuItemModel(BaseModel):
	text: str
	link: str
	children: List['MenuItemModel'] = []

MenuItemModel.update_forward_refs() # Get recursive model prepared

#############
# BUILT INS #
#############

class MenuItemChild(EmbeddedDocument):
	text = StringField(required=True)
	link = StringField(required=True)
	children = EmbeddedDocumentListField('MenuItemChild')

	def serialize(self):
		return {
			'text': self.text,
			'link': self.link,
			'children': list(map(lambda mi: mi.serialize(), self.children))
		}

class MenuItem(Document):
	text = StringField(required=True)
	link = StringField(required=True)
	children = EmbeddedDocumentListField('MenuItemChild')

	def serialize(self):
		return {
			'text': self.text,
			'link': self.link,
			'children': list(map(lambda mi: mi.serialize(), self.children))
		}

class CartItem(EmbeddedDocument):
	product = ReferenceField('Product')
	qty = IntField()

	# For orders
	price = DecimalField(precision=2)

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
				'price': float(self.product.price) if self.product.price else 0,
				'qty': self.qty
			}

class User(Document):
	email = EmailField(required=True, unique=True)
	password = StringField(required=True, min_length=6)
	salt = StringField()
	otpSecret = StringField()
	twoFactorEnabled = BooleanField()
	admin = BooleanField()
	firstName = StringField()
	lastName = StringField()

	cart = EmbeddedDocumentListField('CartItem')
	stripeCustomerID = StringField()

	def hash_password(self):
		chars = string.ascii_letters + string.punctuation
		size = 12
		self.salt = ''.join(random.choice(chars) for x in range(size))
		self.password = _bcrypt.hash(self.password + self.salt)

	def check_password(self, password):
		return _bcrypt.verify(password + self.salt, self.password)

	def get_totp_uri(self):
		return 'otpauth://totp/SEPHIRA:{0}?secret={1}&issuer=SEPHIRA'.format(self.email, self.otpSecret) # TODO: replace SEPHIRA with your app name

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

class Order(Document):
	orderer = ReferenceField('User')
	orderStatus = StringField(choices=['not placed', 'pending', 'paid', 'shipped', 'completed', 'failed'])
	products = EmbeddedDocumentListField('CartItem')
	coupons = ListField(ReferenceField('Coupon'))
	taxRate = FloatField()
	shippingType = StringField(choices=['dollar', 'percent'])
	shippingRate = FloatField()
	addresses = DictField()
	paymentIntentID = StringField()
	paypalCaptureID = StringField()
	createdAt = DateTimeField(default=datetime.datetime.now)
	modified = DateTimeField(default=datetime.datetime.now)

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
			'shippingType': self.shippingType,
			'shippingRate': self.shippingRate,
			'addresses': self.addresses,
			'createdAt': str(self.createdAt),
			'modified': str(self.modified)
		}

class Review(Document):
	reviewer = ReferenceField('User', unique_with='product', required=True) # 1 review per person per product
	product = ReferenceField('Product', required=True)
	score = DecimalField(precision=1, min_value=0, max_value=5, required=True)
	review = StringField()

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

class UsTaxJurisdiction(Document):
	zip = StringField(primary_key=True)
	state = StringField()
	taxRegionName = StringField()
	stateRate = FloatField()
	estimatedCombinedRate = FloatField()
	estimatedCountyRate = FloatField()
	estimatedCityRate = FloatField()
	estimatedSpecialRate = FloatField()
	riskLevel = IntField()

	meta = {
		'indexes': [
			'state'
		]
	}

	def serialize(self):
		return {
			'zip': self.zip,
			'state': self.state,
			'taxRegionName': self.taxRegionName,
			'stateRate': self.stateRate,
			'estimatedCombinedRate': self.estimatedCombinedRate,
			'estimatedCountyRate': self.estimatedCountyRate,
			'estimatedCityRate': self.estimatedCityRate,
			'estimatedSpecialRate': self.estimatedSpecialRate,
			'riskLevel': self.riskLevel
		}

class ShippingRate(EmbeddedDocument):
	rate = FloatField()
	type = StringField(choices=['dollar', 'percent'])
	minCutoff = FloatField()
	maxCutoff = FloatField()

	def serialize(self):
		return {
			'rate': self.rate,
			'type': self.type,
			'minCutoff': self.minCutoff,
			'maxCutoff': self.maxCutoff
		}

class UsShippingZone(Document):
	applicableStates = ListField(StringField(unique=True, choices=[
		"AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DC", "DE", "FL", "GA", 
		"HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", 
		"MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
		"NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", 
		"SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
	]))
	rates = EmbeddedDocumentListField('ShippingRate')
	default = BooleanField(unique=True)

	def serialize(self):
		mappedRates = list(map(lambda r: r.serialize(), self.rates))
		return {
			'id': str(self.id),
			'applicableStates': self.applicableStates,
			'rates': mappedRates,
			'default': self.default
		}

#########
# POSTS #
#########

class Post(Document):
	'''
	The main abstract post model. Use this class to create dynamic components with inherited fuzzy searching capabilities, visibility, and dynamic edit form creation.
	'''
	author = ReferenceField('User')
	title = StringField()
	slug = StringField(unique=True, regex=re.compile('^([/]?)+([a-z0-9]?)+(?:-[a-z0-9]+)*$'))
	content = StringField()
	excerpt = StringField()
	status = StringField(choices=['publish', 'draft', 'private', 'deactivated'], default='draft')
	categories = ListField(StringField())

	categoriesPrefixNgrams = ListField(StringField())
	titleNgrams = StringField()
	titlePrefixNgrams = StringField()

	created = DateTimeField(default=datetime.datetime.now())
	modified = DateTimeField(default=datetime.datetime.now())

	meta = {
		'abstract': True,
		'indexes': [
			{
				'fields': ['$titleNgrams', '$titlePrefixNgrams', '$categoriesPrefixNgrams'],
				'default_language': 'english',
				'weights': { 'titleNgrams': 100, 'titlePrefixNgrams': 200, 'categoriesPrefixNgrams': 20 }
			}
		]
	}

	def generateNgrams(self):
		'''
		Generate ngram strings for fuzzy searching
		'''
		self.titleNgrams = u' '.join(make_ngrams(self.title.lower()))
		self.titlePrefixNgrams = u' '.join(make_ngrams(self.title.lower(), True))			
		self.categoriesPrefixNgrams = list(map(lambda c: u' '.join(make_ngrams(c.lower(), True)), self.categories))

	@classmethod
	def schema(cls):
		'''
		Return the schema used for editing
		'''
		return [
			{
				'name': 'title',
				'niceName': 'Title',
				'controlType': 'input',
				'validators': {
					'required': True
				}
			},
			{
				'name': 'slug',
				'niceName': 'Slug',
				'controlType': 'input',
				'validators': {
					'required': True,
					'pattern': '^([/]?)+([a-z0-9]?)+(?:-[a-z0-9]+)*$'
				}
			},
			{
				'name': 'content',
				'niceName': 'Content',
				'controlType': 'wysiwyg'
			},
			{
				'name': 'excerpt',
				'niceName': 'Excerpt',
				'controlType': 'textarea'
			},
			{
				'name': 'status',
				'niceName': 'Status',
				'controlType': 'select',
				'options': [
					{ 'key': 'Publish', 'value': 'publish' },
					{ 'key': 'Private', 'value': 'private' },
					{ 'key': 'Deactivated', 'value': 'deactivated' }
				]
			},
			{
				'name': 'categories',
				'niceName': 'Categories',
				'controlType': 'FormArray',
				'array': {
					'name': 'category',
					'niceName': 'Category',
					'controlType': 'input',
					'validators': {
						'required': True
					}
				}
			}
		]

	def serialize(self):
		'''
		Serialize the class to a dictionary for JSONification
		'''
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

class Product(Post):
	sku = StringField()
	img = ListField(StringField())
	price = DecimalField(precision=2)
	digital = BooleanField(default=False)
	taxable = BooleanField(default=True)

	hasStock = BooleanField(default=False)
	stock = IntField()

	totalReviews = IntField(default=0)
	avgReviewScore = FloatField(default=0)

	def addReview(self, score):
		self.avgReviewScore = ((self.avgReviewScore * self.totalReviews) + int(score)) / (self.totalReviews + 1)
		self.totalReviews = self.totalReviews + 1

	@classmethod
	def schema(cls):
		return super().schema() + [
			{
				'name': 'sku',
				'niceName': 'SKU',
				'controlType': 'input'
			},
			{
				'name': 'img',
				'niceName': 'Images',
				'controlType': 'media-browser',
				'multiple': True
			},
			{
				'name': 'price',
				'niceName': 'Price',
				'controlType': 'input',
				'type': 'number'
			},
			{
				'name': 'digital',
				'niceName': 'Digital',
				'controlType': 'checkbox'
			},
			{
				'name': 'taxable',
				'niceName': 'Taxable',
				'controlType': 'checkbox'
			},
			{
				'name': 'hasStock',
				'niceName': 'Has Stock',
				'controlType': 'checkbox'
			},
			{
				'name': 'stock',
				'niceName': 'Stock',
				'controlType': 'input',
				'type': 'number',
				'validators': {
					'required': True
				}
			}
		]

	def serialize(self):
		return {
			**super().serialize(),
			'sku': self.sku,
			'img': self.img,
			'price': float(self.price) if self.price else None,
			"digital": self.digital,
			"taxable": self.taxable,
			'hasStock': self.hasStock,
			'stock': self.stock,
			'totalReviews': self.totalReviews,
			'avgReviewScore': round(self.avgReviewScore, 1) # Round to 1 decimal place
		}

class Coupon(Post):
	code = StringField(unique=True)
	discountType = StringField(choices=['percent', 'dollar'])
	discount = FloatField()
	storeWide = BooleanField(default=False)
	applicableProducts = ListField(ReferenceField('Product'))
	uses = IntField(default=0)
	maxUses = IntField(default=-1)

	@classmethod
	def schema(cls):
		return super().schema() + [
			{
				'name': 'code',
				'niceName': 'Code',
				'controlType': 'input'
			},
			{
				'name': 'discountType',
				'niceName': 'Discount Type',
				'controlType': 'select',
				'options': [
					{ 'key': 'Percent', 'value': 'percent' },
					{ 'key': 'Dollar', 'value': 'dollar' }
				]
			},
			{
				'name': 'discount',
				'niceName': 'Discount',
				'controlType': 'input',
				'type': 'number'
			},
			{
				'name': 'storeWide',
				'niceName': 'Store wide',
				'controlType': 'checkbox'
			},
			{
				'name': 'applicableProducts',
				'niceName': 'Applicable Products',
				'controlType': 'post-select',
				'type': 'models.Product',
				'multiple': True
			},
			{
				'name': 'maxUses',
				'niceName': 'Max Uses',
				'controlType': 'input',
				'type': 'number'
			}
		]

	def serialize(self):
		return {
			**super().serialize(),
			'code': self.code,
			'discountType': self.discountType,
			'discount': self.discount,
			'storeWide': self.storeWide,
			'applicableProducts': list(map(lambda p: str(p.id), self.applicableProducts)),
			'uses': self.uses,
			'maxUses': self.maxUses
		}

User.register_delete_rule(Post, 'author', CASCADE)

# Import any aditional post types here so Post knows about them