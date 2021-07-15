'''
Socket routes

This file probably shouldn't be used. See https://flask-socketio.readthedocs.io/en/latest/getting_started.html#class-based-namespaces for a better implementation
'''

from flask_socketio import emit
from app import socketio

@socketio.on('connect')
def test_connect():
	print('Client Connected')
	emit('connection', {'data': 'Connected'})

@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')