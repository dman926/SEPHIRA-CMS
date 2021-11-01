from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List


class ConnectionManager:
	def __init__(self):
		self.activeConnections: List[WebSocket] = []

	async def connect(self, websocket: WebSocket):
		await websocket.accept()
		self.activeConnections.append(websocket)

	def disconnect(self, websocket: WebSocket):
		self.activeConnections.remove(websocket)

router = APIRouter(
	tags=['Control Sockets']
)

manager = ConnectionManager()

@router.websocket('/socket.io/')
async def constrolSocket(websocket: WebSocket):
	await manager.connect(websocket)
	print('Client connected')
	try:
		while True:
			# This socket does not expect incomming data
			data = await websocket.receive_text()
	except WebSocketDisconnect:
		manager.disconnect(websocket)
		print('Client disconnected')