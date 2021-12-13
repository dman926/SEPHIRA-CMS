from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(
	tags=['Sockets']
)

###########
# HELPERS #
###########

class ConnectionManager:
	def __init__(self):
		self.active_connections: list[WebSocket] = []

	async def connect(self, websocket: WebSocket):
		await websocket.accept()
		self.active_connections.append(websocket)
	
	def disconnect(self, websocket: WebSocket):
		self.active_connections.remove(websocket)

	async def send_message(self, message: dict, websocket: WebSocket):
		await websocket.send_json(message)

	async def broadcast(self, message: dict):
		for connection in self.active_connections:
			await connection.send_json(message)

###########
# SOCKETS #
###########

rootManager = ConnectionManager()

@router.websocket('/')
async def control_socket(websocket: WebSocket):
	await rootManager.connect(websocket)
	print('Client connected')
	await rootManager.broadcast({ 'connected': True })
	await rootManager.send_message({ 'test': True }, websocket)
	try:
		while True:
			# This socket does not expect incoming data
			test = await websocket.receive_text()
			print(test)
	except WebSocketDisconnect:
		rootManager.disconnect(websocket)
		print('Client disconnected')