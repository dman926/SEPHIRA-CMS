from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from starlette import status
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp

from config import CORSSettings, FastAPISettings, UvicornSettings
import logging

####
# Custom Middlewares #
####

class LimitPostContentSizeMiddleware(BaseHTTPMiddleware):
	def __init__(self, app: ASGIApp, max_upload_size: int) -> None:
		super().__init__(app)
		self.max_upload_size = max_upload_size

	async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
		if request.method == 'POST':
			if 'content-length' not in request.headers:
				return Response(status_code=status.HTTP_411_LENGTH_REQUIRED)
			content_length = int(request.headers['content-lenght'])
			if content_length > self.max_upload_size:
				return Response(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)
		return await call_next(request)

####
#  #
####

logging.basicConfig(filename="log.log", level=logging.INFO, format=f'%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s')
logger = logging.getLogger(__name__)
app = FastAPI(debug=FastAPISettings.DEBUG)

app.add_middleware(
	CORSMiddleware,
	allow_origins=CORSSettings.ALLOW_ORIGINS,
	allow_methods=['*'],
	allow_headers=['*']
)

if UvicornSettings.MAX_CONTENT_SIZE:
	app.add_middleware(
		LimitPostContentSizeMiddleware,
		max_upload_size=UvicornSettings.MAX_CONTENT_SIZE
	)

@app.on_event('startup')
async def startup():
	logger.info('-- STARTING UP --')
	print('-- STARTING UP --')
	from database.db import initialize_db
	initialize_db()
	from resources.routes import initialize_routes
	initialize_routes(app)

	# TODO: make a request to /payment/nowpayments/available-coins to refresh the available coins list

	print('-- STARTED UP --')
	logger.info('-- STARTED UP --')

@app.on_event('shutdown')
async def shutdown():
	logger.info('-- SHUTTING DOWN --')
	print('-- SHUTTING DOWN --')
	from database.db import close_db
	close_db()
	print('-- SHUT DOWN --')
	logger.info('-- SHUT DOWN --')

if __name__== '__main__':
	import uvicorn
	uvicorn.run('main:app', reload=UvicornSettings.USE_RELOADER, log_level=UvicornSettings.LOG_LEVEL, port=UvicornSettings.PORT)