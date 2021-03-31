# Flask-API

Fixed and minimally documented version of [this guide](https://dev.to/paurakhsharma/series/3672). Code is pretty self explanatory since most of it is handled by Flask and its extensions.

Works great as a Flask API skeleton, complete with authentication, password hashing, JSON Web Tokens, websocket server, mongodb integration, and emailing.

(Preferably) In a virtual python environment:

`pip install -r requirements.txt`

To run the local Flask server

`flask run`

To run the production server

`gunicorn --bind 0.0.0.0:5000 app:app` with 5000 being the port of the api. Use gunicorn in conjunction with the web server (Apache, NGINX) using a reverse proxy.

## Documentations

* [Flask Documentation](https://flask.palletsprojects.com/en/1.1.x/)
* [Flask-RESTful Documentation](https://flask-restful.readthedocs.io/en/latest/)
* [Flask-SocketIO Documentation](https://flask-socketio.readthedocs.io/en/latest/)