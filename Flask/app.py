'''
Main Flask application
'''

from flask import Flask
from flask_cors import CORS
from flask_restful_swagger_2 import Api
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from flask_mail import Mail
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_apscheduler import APScheduler

from database.db import initialize_db
from tasks.tasks import initialize_tasks

import os, logging

import stripe
from coinbase_commerce.client import Client
from paypalcheckoutsdk.core import PayPalHttpClient, SandboxEnvironment, LiveEnvironment
from secret import stripe_sk, paypal_client_id, paypal_secret, coinbase_commerce_api_key

PRODUCTION = False

stripe.api_key = stripe_sk
ccClient = Client(api_key=coinbase_commerce_api_key)
paypal_client = None

app = Flask(__name__)
if PRODUCTION:
	app.config['JWT_SECRET_KEY'] = 'even-more-secret' # CHANGE THIS
	app.config['MAIL_SERVER'] = "localhost"
	app.config['MAIL_PORT'] = "1025"
	app.config['MAIL_USERNAME'] = "support@flaskapi.com"
	app.config['MAIL_PASSWORD'] = ""
	app.config['PROPAGATE_EXCEPTIONS'] = True
	app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), '..', 'ANGULARFOLDERNAME', 'dist', 'sephira', 'browser', 'assets') # Change ANGULARFOLDERNAME to the name of the folder it is hosted in
	app.config['MONGODB_SETTINGS'] = 'mongodb://localhost/sephira'
	resources = {r"/*": {"origins": "https://www.website.com"}}
	socketResources = "www.website.com"
	base = '/'
	paypal_client = PayPalHttpClient(LiveEnvironment(client_id=paypal_client_id, client_secret=paypal_secret))
else:
	app.config['JWT_SECRET_KEY'] = 'super-secret'
	app.config['MAIL_SERVER'] = "localhost"
	app.config['MAIL_PORT'] = "1025"
	app.config['MAIL_USERNAME'] = "support@flaskapi.com"
	app.config['MAIL_PASSWORD'] = ""
	app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), '..', 'Angular', 'src', 'assets', 'uploads')
	app.config['MONGODB_SETTINGS'] = 'mongodb://localhost/sephira-test'
	resources = {r"/*": {"origins": "*"}}
	socketResources = "*"
	base = '/api/'
	paypal_client = PayPalHttpClient(SandboxEnvironment(client_id=paypal_client_id, client_secret=paypal_secret))

logging.basicConfig(filename="log.log", level=logging.WARNING, format=f'%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s')

app.config['SCHEDULER_API_ENABLED'] = True

mail = Mail(app)

cors = CORS(app, resources=resources)
api = Api(app, title='SEPHIRA API', api_version='1.0', api_spec_url='/api/spec')
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins=socketResources)
limiter = Limiter(app, key_func=get_remote_address, default_limits=["25000 per day", "2500 per hour"])
scheduler = APScheduler()

scheduler.init_app(app)

initialize_db(app)

from resources.routes import initialize_routes

initialize_routes(api, base)

initialize_tasks(scheduler)
