from fastapi import FastAPI

from config import ShopSettings, CoinbaseCommerceSettings, PayPalSettings, StripeSettings

from .admin import router as admin_router
from .auth import router as auth_router
from .file import router as file_router
from .menu_item import router as menu_item_router
from .post import router as post_router

from .sockets import router as socket_router

if ShopSettings.ENABLE:
	from .cart import router as cart_router
	from .order import router as order_router
	from .product import router as product_router
	from .shipping import router as shipping_router
	from .tax import router as tax_router
	if CoinbaseCommerceSettings.ENABLE:
		from .coinbase import router as coinbase_router
	if PayPalSettings.ENABLE:
		from .paypal import router as paypal_router
	if StripeSettings.ENABLE:
		from .stripe import router as stripe_router

routers = [
	# REST
	admin_router,
	auth_router,
	file_router,
	menu_item_router,
	post_router,

	# SOCKETS
	socket_router
]

if ShopSettings.ENABLE:
	routers.append(cart_router)
	routers.append(order_router)
	routers.append(product_router)
	routers.append(shipping_router)
	routers.append(tax_router)
	if CoinbaseCommerceSettings.ENABLE:
		routers.append(coinbase_router)
	if PayPalSettings.ENABLE:
		routers.append(paypal_router)
	if StripeSettings.ENABLE:
		routers.append(stripe_router)

def initialize_routes(app: FastAPI):
	for router in routers:
		app.include_router(router)