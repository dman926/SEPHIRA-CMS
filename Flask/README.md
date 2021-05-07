# Flask-API

(Preferably) In a virtual python environment:

`pip install wheel`
`pip install -r requirements.txt`

Create a secret.py file and store it in the same folder as app.py that contains:

* stripe_sk (Shopping-Template only)
* coinbase_commerce_api_key (Shopping-Template only)
* coinbase_commerce_shared_secret (Shopping-Template only)
* braintree_merchant_id (Shopping-Template only)
* braintree_public_key (Shopping-Template only)
* braintree_private_key (Shopping-Template only)
* reCAPTCHA_V3_secret 

To run the local (nonproduction) Flask server

`python wsgi.py`

To run the production server

`pip install uwsgi`

Included are the app.ini configuration, NGINX example Location configs, and a systemd service to start the server with systemd.

## Documentation

API Swagger: available at endpoint `/api/spec.json`