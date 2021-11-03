from fastapi import FastAPI

from .admin import router as adminRouter
from .auth import router as authRouter
from .cart import router as cartRouter
from .coinbase import router as coinbaseRouter
from .file import router as fileRouter
from .menuItem import router as menuItemRouter
from .order import router as orderRouter
from .paypal import router as paypalRouter
from .post import router as postRouter
from .product import router as productRouter
from .shipping import router as shippingRouter
from .stripe import router as stripeRouter
from .tax import router as taxRouter

from .sockets import router as socketRouter

routers = [
	# REST
	adminRouter,
	authRouter,
	cartRouter,
	coinbaseRouter,
	fileRouter,
	menuItemRouter,
	orderRouter,
	paypalRouter,
	postRouter,
	productRouter,
	shippingRouter,
	stripeRouter,
	taxRouter,

	# SOCKETS
	socketRouter
]

def initialize_routes(app: FastAPI):
	for router in routers:
		app.include_router(router)