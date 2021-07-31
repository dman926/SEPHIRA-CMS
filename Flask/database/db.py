'''
Holds MongoEngine wrapper
'''

from mongoengine import connect

def initialize_db(app):
	connect(host=app.config['MONGODB_SETTINGS'])