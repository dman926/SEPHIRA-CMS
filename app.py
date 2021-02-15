'''
Main Flask application
'''

from flask import Flask
from flask_restful import Api
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_mail import Mail

from database.db import initialize_db
from resources.routes import initialize_routes
from resources.errors import errors

PRODUCTION = False

app = Flask(__name__)
if PRODUCTION:
	app.config['JWT_SECRET_KEY'] = 't1NP63m4wnBg6nyHYKfmc2TpCOGI4nss'
	app.config['MAIL_SERVER']: "localhost"
	app.config['MAIL_PORT'] = "1025"
	app.config['MAIL_USERNAME'] = "support@movie-bag.com"
	app.config['MAIL_PASSWORD'] = ""
	app.config['MONGODB_SETTINGS'] = {
    	'host': 'mongodb://localhost/movie-bag'
	}
else:
	app.config['JWT_SECRET_KEY'] = 'super-secret'
	app.config['MAIL_SERVER'] = "localhost"
	app.config['MAIL_PORT'] = "1025"
	app.config['MAIL_USERNAME'] = "support@movie-bag.com"
	app.config['MAIL_PASSWORD'] = ""
	app.config['MONGODB_SETTINGS'] = {
	    'host': 'mongodb://localhost/movie-bag-test'
	}
mail = Mail(app)

api = Api(app, errors=errors)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

initialize_db(app)
initialize_routes(api)

if __name__ == '__main__':
	app.run(debug=True, port=5000)
