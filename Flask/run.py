from app import app, PRODUCTION

if __name__ == '__main__':
	app.run(debug=not PRODUCTION)
	# socketio.run(app)