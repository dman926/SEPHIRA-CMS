'''
API Endpoints
'''

from .auth import SignupApi, LoginApi, ForgotPassword, ResetPassword, TokenRefresh, CheckPassword, UserApi, TwoFactorApi
from .file import UploaderApi, MediaApi, SingleMediaApi

from .menuItem import MenuItemsApi
from .page import PagesApi, PageApi
from .product import ProductsApi, ProductApi, ProductReviewsApi, ProductReviewsCountApi, ProductReviewAllowedApi

from .order import OrdersApi, OrderApi
from .cart import CartApi, CouponCheckApi
from .usTaxJurisdiction import UsTaxJurisdictionApi
from .usShippingZone import UsShippingZoneApi

from .stripe import StripeCheckoutApi, StripeApi
from .paypal import PayPalCreateTransactionApi, PayPalCaptureTransactionApi, PayPalApi
from .coinbase import CoinbaseCheckoutApi, CoinbaseApi

from .admin import AdminApi, AdminUsersApi, AdminUserApi, AdminUsersCountApi, AdminPagesApi, AdminPageApi, AdminPagesCountApi, AdminPageSlugApi, AdminProductsApi, AdminProductApi, AdminProductCountApi, AdminProductSlugAvailableApi, AdminCouponsApi, AdminCouponApi, AdminCouponCountApi, AdminCouponSlugAvailableApi, AdminOrdersApi, AdminOrderApi, AdminOrderCountApi,AdminUsShippingZonesApi, AdminUsShippingZoneApi, AdminUsShippingZoneCountApi, AdminMenuItemsApi

import resources.sockets

def initialize_routes(api, base):
	api.add_resource(SignupApi, base + 'auth/signup')
	api.add_resource(LoginApi, base + 'auth/login')
	api.add_resource(ForgotPassword, base + 'auth/forgot')
	api.add_resource(ResetPassword, base + 'auth/reset')
	api.add_resource(TokenRefresh, base + 'auth/refresh')
	api.add_resource(CheckPassword, base + 'auth/checkPassword')
	api.add_resource(UserApi, base + 'auth/user')
	api.add_resource(TwoFactorApi, base + 'auth/2fa')

	api.add_resource(UploaderApi, base + 'file/uploader')
	api.add_resource(MediaApi, base + 'file/media')
	api.add_resource(SingleMediaApi, base + 'file/media/<filename>')

	api.add_resource(MenuItemsApi, base + 'menuItems')
	api.add_resource(PagesApi, base + 'page/pages')
	api.add_resource(PageApi, base + 'page/page')
	api.add_resource(ProductsApi, base + 'product/products')
	api.add_resource(ProductApi, base + 'product/product')
	api.add_resource(ProductReviewsApi, base + 'product/product/<id>/reviews')
	api.add_resource(ProductReviewsCountApi, base + 'product/product/<id>/reviews/count')
	api.add_resource(ProductReviewAllowedApi, base + 'product/product/<id>/reviewAllowed')

	api.add_resource(OrdersApi, base + 'order/orders')
	api.add_resource(OrderApi, base + 'order/order/<id>')
	api.add_resource(CartApi, base + 'cart/cart')
	api.add_resource(CouponCheckApi, base + 'cart/couponCheck')
	api.add_resource(UsTaxJurisdictionApi, base + 'tax/us')
	api.add_resource(UsShippingZoneApi, base + 'shipping/us')

	api.add_resource(StripeCheckoutApi, base + 'payment/stripe/checkout')
	api.add_resource(StripeApi, base + 'payment/stripe/webhook')
	api.add_resource(PayPalCreateTransactionApi, base + 'payment/paypal/checkout')
	api.add_resource(PayPalCaptureTransactionApi, base + 'payment/paypal/capture')
	api.add_resource(PayPalApi, base + 'payment/paypal/webhook')
	api.add_resource(CoinbaseCheckoutApi, base + 'payment/coinbase/checkout')
	api.add_resource(CoinbaseApi, base + 'payment/coinbase/webhook')

	api.add_resource(AdminApi, base + 'admin/admin')
	api.add_resource(AdminUsersApi, base + 'admin/users')
	api.add_resource(AdminUserApi, base + 'admin/user/<id>')
	api.add_resource(AdminUsersCountApi, base + 'admin/users/count')
	api.add_resource(AdminPagesApi, base + 'admin/pages')
	api.add_resource(AdminPageApi, base + 'admin/page/<id>')
	api.add_resource(AdminPagesCountApi, base + 'admin/pages/count')
	api.add_resource(AdminPageSlugApi, base + 'admin/pages/slugTaken')
	api.add_resource(AdminProductsApi, base + 'admin/products')
	api.add_resource(AdminProductApi, base + 'admin/product/<id>')
	api.add_resource(AdminProductCountApi, base + 'admin/products/count')
	api.add_resource(AdminProductSlugAvailableApi, base + 'admin/products/slugTaken')
	api.add_resource(AdminCouponsApi, base + 'admin/coupons')
	api.add_resource(AdminCouponApi, base + 'admin/coupon/<id>')
	api.add_resource(AdminCouponCountApi, base + 'admin/coupons/count')
	api.add_resource(AdminCouponSlugAvailableApi, base + 'admin/coupons/slugTaken')
	api.add_resource(AdminOrdersApi, base + 'admin/orders')
	api.add_resource(AdminOrderApi, base + 'admin/order/<id>')
	api.add_resource(AdminOrderCountApi, base + 'admin/orders/count')
	api.add_resource(AdminUsShippingZonesApi, base + 'admin/usShippingZones')
	api.add_resource(AdminUsShippingZoneApi, base + 'admin/usShippingZone/<id>')
	api.add_resource(AdminUsShippingZoneCountApi, base + 'admin/usShippingZones/count')
	api.add_resource(AdminMenuItemsApi, base + 'admin/menuItems')