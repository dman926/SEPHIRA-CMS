from flask_restful import Resource
from flask_socketio import send, emit
from app import socketio

class SocketApi(Resource):
	def get(self):
		return ''

	@socketio.on('connect')
	def test_connect():
		print('client-connected')
		emit('connection', {'data': 'Connected'})

	@socketio.on('disconnect')
	def test_disconnect():
	    print('Client disconnected')