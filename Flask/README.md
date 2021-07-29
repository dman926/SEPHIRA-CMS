(Preferably) In a virtual python environment:

`pip install wheel`
`pip install -r requirements.txt`

Create a secret.py file and store it in the same folder as app.py that contains:

* stripe_sk
* coinbase_commerce_api_key
* coinbase_commerce_shared_secret
* paypal_client_id
* paypal_secret
* reCAPTCHA_V3_secret 

To run the local (nonproduction) Flask server

`python wsgi.py`

To run the production server

`pip install uwsgi`

Included are the app.ini configuration, NGINX example Location configs, and a systemd service to start the server with systemd.

## Documentation

API Swagger: available at endpoint `/api/spec.json`
