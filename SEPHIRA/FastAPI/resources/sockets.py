from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Optional

import base64
import os

router = APIRouter(
	tags=['Sockets']
)

###########
# HELPERS #
###########


class WebsocketConnection():
	def __init__(self, sid: str, socket: WebSocket, metadata: Optional[dict] = None, jwt: Optional[str] = None):
		self.sid = sid
		self.socket = socket
		self.metadata = metadata
		self.jwt = jwt


class ConnectionManager:
	def __init__(self):
		self.active_connections: list[WebsocketConnection] = []

	async def connect(self, websocket: WebSocket) -> str:
		await websocket.accept()
		do = True
		sid = base64.b32encode(os.urandom(32)).decode('utf8')
		if (len(self.active_connections) == 0):
			do = False
		while do:
			for connection in self.active_connections:
				if connection.sid != sid:
					do = False
					break
			if do:
				sid = base64.b32encode(os.urandom(32)).decode('utf8')
		self.active_connections.append(WebsocketConnection(sid=sid, socket=websocket))
		return sid
	
	def disconnect(self, websocket: WebSocket) -> None:
		for i in range(len(self.active_connections)):
			if self.active_connections[i].socket == websocket:
				self.active_connections.pop(i)
				break

	async def send_message(self, message: dict, websocket: WebSocket) -> None:
		await websocket.send_json(message)

	async def broadcast(self, message: dict) -> None:
		for connection in self.active_connections:
			await connection.send_json(message)
	
	def get_socket_from_sid(self, sid: str) -> Optional[WebSocket]:
		for connection in self.active_connections:
			if connection.sid == sid:
				return connection.socket
		return None

	def set_metadata_from_sid(self, sid: str, metadata: dict) -> None:
		for connection in self.active_connections:
			if connection.sid == sid:
				connection.metadata = metadata
				break

	def get_metadata_from_sid(self, sid: str) -> Optional[dict]:
		for connection in self.active_connections:
			if connection.sid == sid:
				return connection.metadata

	def set_jwt_from_sid(self, sid: str, jwt: Optional[str] = None) -> None:
		for connection in self.active_connections:
			if connection.sid == sid:
				connection.jwt = jwt
				break

	def get_sockets_from_jwt(self, jwt: Optional[str] = None) -> list[WebSocket]:
		sockets: list[WebSocket] = []
		for connection in self.active_connections:
			if connection.jwt == jwt:
				sockets.append(connection.socket)
		return sockets

###########
# SOCKETS #
###########

rootManager = ConnectionManager()

@router.websocket('/')
async def control_socket(websocket: WebSocket):
	await rootManager.connect(websocket)
	print('Client connected')
	try:
		while True:
			# This socket does not expect incoming data
			await websocket.receive_text()
	except WebSocketDisconnect:
		rootManager.disconnect(websocket)
		print('Client disconnected')

orderUpdateManager = ConnectionManager()

@router.websocket('/order-update/{orderID}')
async def order_update_socket(websocket: WebSocket, orderID: str):
	sid = await orderUpdateManager.connect(websocket)
	orderUpdateManager.set_metadata_from_sid(sid, { 'orderID': orderID })
	await orderUpdateManager.send_message(sid, websocket)
	try:
		while True:
			payload = await websocket.receive_json()
			if 'type' in payload and 'payload' in payload:
				if payload['type'] == 'auth' and payload['payload'] != None:
					orderUpdateManager.set_jwt_from_sid(sid, payload['payload'])
					await orderUpdateManager.send_message({ 'type': 'auth', 'payload': 'authenticated' }, websocket)
	except WebSocketDisconnect:
		orderUpdateManager.disconnect(websocket)
