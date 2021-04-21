'''
Socket routes
'''

from flask_socketio import send, emit
from app import socketio

@socketio.on('connect')
def test_connect():
	print('Client Connected')
	emit('connection', {'data': 'Connected'})

@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')