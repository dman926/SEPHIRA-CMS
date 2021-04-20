from app import socketio, app, PRODUCTION

if __name__ == '__main__':
	socketio.run(app, debug=not PRODUCTION)