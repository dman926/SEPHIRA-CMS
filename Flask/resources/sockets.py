'''
Socket routes
'''

from flask_socketio import send, emit
from app import socketio

@socketio.on('connect')
def test_connect():
	print('client-connected')
	emit('connection', {'data': 'Connected'})

@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')