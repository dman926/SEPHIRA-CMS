from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(
	tags=['Sockets']
)

@router.websocket('/')
async def controlSocket(websocket: WebSocket):
	await websocket.accept()
	print('Client connected')
	try:
		while True:
			# This socket does not expect incoming data
			await websocket.receive_text()
	except WebSocketDisconnect:
		print('Client disconnected')