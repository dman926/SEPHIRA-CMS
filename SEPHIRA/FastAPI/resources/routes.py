from fastapi import FastAPI

from config import CoinbaseCommerceSettings, PayPalSettings, StripeSettings

from .admin import router as admin_router
from .auth import router as auth_router
from .cart import router as cart_router
from .file import router as file_router
from .menu_item import router as menu_item_router
from .order import router as order_router
from .post import router as post_router
from .product import router as product_router
from .shipping import router as shipping_router
from .tax import router as tax_router

from .sockets import router as socket_router

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
	cart_router,
	file_router,
	menu_item_router,
	order_router,
	post_router,
	product_router,
	shipping_router,
	tax_router,

	# SOCKETS
	socket_router
]

if CoinbaseCommerceSettings.ENABLE:
	routers.append(coinbase_router)
if PayPalSettings.ENABLE:
	routers.append(paypal_router)
if StripeSettings.ENABLE:
	routers.append(stripe_router)

def initialize_routes(app: FastAPI):
	for router in routers:
		app.include_router(router)