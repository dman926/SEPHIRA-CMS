'''
Sockets
'''

from flask_socketio import emit, Namespace

class MainSpace(Namespace):
	def on_connect(self):
		print('Client Connected')
		emit('connection', {'data': 'Connected'})

	def on_disconnect(self):
	    print('Client disconnected')