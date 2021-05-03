from app import socketio, app, scheduler, PRODUCTION



if __name__ == '__main__':
	scheduler.start()
	socketio.run(app, debug=not PRODUCTION, use_reloader=False)