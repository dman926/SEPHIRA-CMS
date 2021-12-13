from fastapi import APIRouter, WebSocket, WebSocketDisconnect

import base64
import os

from mongoengine.connection import connect

router = APIRouter(
	tags=['Sockets']
)

###########
# HELPERS #
###########


class WebsocketConnection():
	def __init__(self, sid: str, socket: WebSocket):
		self.sid = sid
		self.socket = socket


class ConnectionManager:
	def __init__(self):
		self.active_connections: list[WebsocketConnection] = []

	async def connect(self, websocket: WebSocket):
		await websocket.accept()
		sid = None
		while True:
			sid = base64.b32encode(os.urandom(32)).decode('utf8')
			if (len(self.active_connections) == 0):
				break
			found = False
			for connection in self.active_connections:
				if connection.sid != sid:
					found = True
					break
			if found:
				break
		self.active_connections.append(WebsocketConnection(sid=sid, socket=websocket))
		return sid
	
	def disconnect(self, websocket: WebSocket):
		for i in range(len(self.active_connections)):
			if self.active_connections[i].socket == websocket:
				self.active_connections.pop(i)
				break

	async def send_message(self, message: dict, websocket: WebSocket):
		await websocket.send_json(message)

	async def broadcast(self, message: dict):
		for connection in self.active_connections:
			await connection.send_json(message)
	
	def get_socket_from_sid(self, sid: str):
		for connection in self.active_connections:
			if connection.sid == sid:
				return connection.socket

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

@router.websocket('/order-update')
async def order_update_socket(websocket: WebSocket):
	sid = await orderUpdateManager.connect(websocket)
	await orderUpdateManager.send_message(sid, websocket)
	try:
		while True:
			# This socket does not expect incoming data
			# Nor does it send any data
			# It is only used to get a sid and open socket for sending data from other functions
			await websocket.receive_text()
	except WebSocketDisconnect:
		orderUpdateManager.disconnect(websocket)
