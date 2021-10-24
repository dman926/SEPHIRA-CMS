'''
API Endpoints
'''

from .auth import SignupApi, LoginApi, ForgotPassword, ResetPassword, TokenRefresh, CheckPassword, UserApi, TwoFactorApi
from .file import UploaderApi, MediaApi, SingleMediaApi

from .menuItem import MenuItemsApi

from .post import PostsApi, PostApi, PostSlugApi
from .product import ProductReviewsApi, ProductReviewsCountApi, ProductReviewAllowedApi

from .order import OrdersApi, OrderApi
from .cart import CartApi, CouponCheckApi
from .usTaxJurisdiction import UsTaxJurisdictionApi
from .usShippingZone import UsShippingZoneApi

from .stripe import StripeCheckoutApi, StripeApi
from .paypal import PayPalCreateTransactionApi, PayPalCaptureTransactionApi, PayPalApi
from .coinbase import CoinbaseCheckoutApi, CoinbaseApi

from .admin import AdminApi, AdminUsersApi, AdminUserApi, AdminUsersCountApi, AdminPostTypesApi, AdminPostSchemaApi, AdminPostsApi, AdminPostApi, AdminPostSlugAvailableApi, AdminOrdersApi, AdminOrderApi, AdminOrderCountApi,AdminUsShippingZonesApi, AdminUsShippingZoneApi, AdminUsShippingZoneCountApi, AdminMenuItemsApi, AdminBackendEditorFilesApi, AdminBackendEditorFileApi, AdminServerReloadApi

#import resources.sockets

from .sockets import MainSpace

routes = [
	########
	# AUTH #
	########
	{ 'module': SignupApi, 'path': 'auth/signup' },
	{ 'module': LoginApi, 'path': 'auth/login' },
	{ 'module': ForgotPassword, 'path': 'auth/forgot' },
	{ 'module': ResetPassword, 'path': 'auth/reset' },
	{ 'module': TokenRefresh, 'path': 'auth/refresh' },
	{ 'module': CheckPassword, 'path': 'auth/checkPassword' },
	{ 'module': UserApi, 'path': 'auth/user' },
	{ 'module': TwoFactorApi, 'path': 'auth/2fa' },

	###########
	# FILE IO #
	###########
	{ 'module': UploaderApi, 'path': 'file/uploader' },
	{ 'module': MediaApi, 'path': 'file/media' },
	{ 'module': SingleMediaApi, 'path': 'file/media/<filename>' },

	##############
	# MENU ITEMS #
	##############
	{ 'module': MenuItemsApi, 'path': 'menuItems' },

	##############
	# POST TYPES #
	##############
	{ 'module': PostsApi, 'path': 'post/posts' },
	{ 'module': PostApi, 'path': 'post/post/id' },
	{ 'module': PostSlugApi, 'path': 'post/post/slug' },
	{ 'module': ProductReviewsApi, 'path': 'product/product/<id>/reviews' },
	{ 'module': ProductReviewsCountApi, 'path': 'product/product/<id>/reviews/count' },
	{ 'module': ProductReviewAllowedApi, 'path': 'product/product/<id>/reviewAllowed' },

	#############
	# BUILT INS #
	#############
	{ 'module': OrdersApi, 'path': 'order/orders' },
	{ 'module': OrderApi, 'path': 'order/order/<id>' },
	{ 'module': CartApi, 'path': 'cart/cart' },
	{ 'module': CouponCheckApi, 'path': 'cart/couponCheck' },
	{ 'module': UsTaxJurisdictionApi, 'path': 'tax/us' },
	{ 'module': UsShippingZoneApi, 'path': 'shipping/us' },

	###########
	# PAYMENT #
	###########
	{ 'module': StripeCheckoutApi, 'path': 'payment/stripe/checkout' },
	{ 'module': StripeApi, 'path': 'payment/stripe/webhook' },
	{ 'module': PayPalCreateTransactionApi, 'path': 'payment/paypal/checkout' },
	{ 'module': PayPalCaptureTransactionApi, 'path': 'payment/paypal/capture' },
	{ 'module': PayPalApi, 'path': 'payment/paypal/webhook' },
	{ 'module': CoinbaseCheckoutApi, 'path': 'payment/coinbase/checkout' },
	{ 'module': CoinbaseApi, 'path': 'payment/coinbase/webhook' },

	#########
	# ADMIN #
	#########
	{ 'module': AdminApi, 'path': 'admin/admin' },
	{ 'module': AdminUsersApi, 'path': 'admin/users' },
	{ 'module': AdminUserApi, 'path': 'admin/user/<id>' },
	{ 'module': AdminUsersCountApi, 'path': 'admin/users/count' },
	{ 'module': AdminPostTypesApi, 'path': 'admin/posts/types' },
	{ 'module': AdminPostSchemaApi, 'path': 'admin/posts/schema' },
	{ 'module': AdminPostsApi, 'path': 'admin/posts' },
	{ 'module': AdminPostApi, 'path': 'admin/post/<id>' },
	{ 'module': AdminPostSlugAvailableApi, 'path': 'admin/posts/slugTaken' },
	{ 'module': AdminOrdersApi, 'path': 'admin/orders' },
	{ 'module': AdminOrderApi, 'path': 'admin/order/<id>' },
	{ 'module': AdminOrderCountApi, 'path': 'admin/orders.count' },
	{ 'module': AdminUsShippingZonesApi, 'path': 'admin/usShippingZones' },
	{ 'module': AdminUsShippingZoneApi, 'path': 'admin/usShippingZone/<id>' },
	{ 'module': AdminUsShippingZoneCountApi, 'path': 'admin/usShippingZones/count' },
	{ 'module': AdminMenuItemsApi, 'path': 'admin/menuItems' },
	{ 'module': AdminBackendEditorFilesApi, 'path': 'admin/backend-editor/files' },
	{ 'module': AdminBackendEditorFileApi, 'path': 'admin/backend-editor/file' },
	{ 'module': AdminServerReloadApi, 'path': 'admin/server/restart' },
]

namespaces = [
	MainSpace()
]

def initialize_routes(api, base):	
	for route in routes:
		try:
			api.add_resource(route['module'], base + route['path'])
		except ValueError:
			pass

def initialize_namespaces(socketio):
	for namespace in namespaces:
		socketio.on_namespace(namespace)
