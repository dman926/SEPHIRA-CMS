from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from config import CORS_SETTINGS

app = FastAPI()

app.add_middleware(
	CORSMiddleware,
	allow_origins=CORS_SETTINGS.ALLOW_ORIGINS,
	allow_methods=['*'],
	allow_headers=['*']
)

@app.on_event('startup')
async def startup():
	print('-- STARTING UP --')
	from database.db import initialize_db
	initialize_db()
	from resources.routes import initialize_routes
	initialize_routes(app)

@app.on_event('shutdown')
async def shutdown():
	print('-- SHUTTING DOWN --')
	from database.db import close_db
	close_db()

@app.websocket('/')
async def controlSocket(websocket: WebSocket):
	await websocket.accept()
	print('Client connected')
	try:
		while True:
			# This socket does not expect incoming data
			await websocket.receive_text()
	except WebSocketDisconnect:
		print('Client disconnected')

'''
@app.get('/socket.io/')
async def test():
	print('test')
'''