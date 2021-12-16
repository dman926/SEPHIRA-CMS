from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import CORSSettings, FastAPISettings, UvicornSettings
import logging

logging.basicConfig(filename="log.log", level=logging.INFO, format=f'%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s')
logger = logging.getLogger(__name__)
app = FastAPI(debug=FastAPISettings.DEBUG)

app.add_middleware(
	CORSMiddleware,
	allow_origins=CORSSettings.ALLOW_ORIGINS,
	allow_methods=['*'],
	allow_headers=['*']
)

@app.on_event('startup')
async def startup():
	logger.info('-- STARTING UP --')
	print('-- STARTING UP --')
	from database.db import initialize_db
	initialize_db()
	from resources.routes import initialize_routes
	initialize_routes(app)
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