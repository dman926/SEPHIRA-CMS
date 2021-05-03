# Flask-API

Fixed and minimally documented version of [this guide](https://dev.to/paurakhsharma/series/3672). Code is pretty self explanatory since most of it is handled by Flask and its extensions.

Works great as a Flask API skeleton, complete with authentication, password salting and hashing, JSON Web Tokens, websocket server, mongodb integration, and emailing.

(Preferably) In a virtual python environment:

`pip install -r requirements.txt`

Create a secret.py file and store it in the same folder as app.py that contains:

* stripe_sk
* coinbase_commerce_api_key
* coinbase_commerce_shared_secret
* braintree_merchant_id 
* braintree_public_key 
* braintree_private_key

To run the local (nonproduction) Flask server

`python wsgi.py`

To run the production server

`pip install wheel`

`pip install uwsgi`

Included are the app.ini configuration, NGINX example Location config, and a systemd service to start the server with systemd.

## Documentations

* API Swagger: available at endpoint `/api/spec.json`
* [Flask Documentation](https://flask.palletsprojects.com/en/1.1.x/)
* [Flask-RESTful Documentation](https://flask-restful.readthedocs.io/en/latest/)
* [Flask-SocketIO Documentation](https://flask-socketio.readthedocs.io/en/latest/)