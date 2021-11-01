from fastapi import FastAPI

from .auth import router as authRouter
from .sockets import router as socketRouter

routers = [
	authRouter,
	#socketRouter
]

def initialize_routes(app: FastAPI):
	for router in routers:
		app.include_router(router)