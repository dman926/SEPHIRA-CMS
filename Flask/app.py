'''
Main Flask application
'''

from flask import Flask
from flask_cors import CORS
from flask_restful import Api
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
# from flask_socketio import SocketIO
from flask_mail import Mail
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_restful_swagger import swagger

from database.db import initialize_db
from resources.routes import initialize_routes
from resources.errors import errors

import os

PRODUCTION = False

app = Flask(__name__)
if PRODUCTION:
	app.config['JWT_SECRET_KEY'] = 'even-more-secret' # CHANGE THIS
	app.config['MAIL_SERVER']: "localhost"
	app.config['MAIL_PORT'] = "1025"
	app.config['MAIL_USERNAME'] = "support@flaskapi.com"
	app.config['MAIL_PASSWORD'] = ""
	app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), '..', 'angular', 'assets', 'uploads')
	app.config['MONGODB_SETTINGS'] = {
		'host': 'mongodb://localhost/flask-api'
	}
	resources = {r"/*": {"origins": "https://api.website.com"}}
	base = '/'
else:
	app.config['JWT_SECRET_KEY'] = 'super-secret'
	app.config['MAIL_SERVER'] = "localhost"
	app.config['MAIL_PORT'] = "1025"
	app.config['MAIL_USERNAME'] = "support@flaskapi.com"
	app.config['MAIL_PASSWORD'] = ""
	app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), '..', 'Angular', 'src', 'assets', 'uploads')
	app.config['MONGODB_SETTINGS'] = {
		'host': 'mongodb://localhost/flask-api-test'
	}
	resources = {r"/api/*": {"origins": "http://localhost:4200"}}
	base = '/api/'

mail = Mail(app)

cors = CORS(app, resources=resources)
api = swagger.docs(Api(app, errors=errors), apiVersion='1.0')
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
# socketio = SocketIO(app)
limiter = Limiter(app, key_func=get_remote_address, default_limits=["2500 per day", "250 per hour"])

initialize_db(app)
initialize_routes(api, base)

if __name__ == '__main__':
	app.run(debug=True)
	# socketio.run(app)