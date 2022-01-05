'''
MongoEngine connector
'''

from mongoengine import connect, disconnect
from config import MongoSettings
from .models import UsTaxJurisdiction

def initialize_db():
	connect(host=MongoSettings.DEFAULT_CONNECT_URI)
	if MongoSettings.DEFAULT_CONNECT_URI != MongoSettings.MEDIA_CONNECT_URI:
		connect(host=MongoSettings.MEDIA_CONNECT_URI, alias='media-db')

	if UsTaxJurisdiction.objects.count() == 0:
		from json import load
		# Load the US tax jurisdictions if they do not exist
		taxJurisdictions = open('database/us_tax_jurisdiction.json', 'r')
		taxJurisdictions = load(taxJurisdictions)
		for taxJurisdiction in taxJurisdictions:
			UsTaxJurisdiction(**taxJurisdiction).save()

def close_db():
	if MongoSettings.DEFAULT_CONNECT_URI != MongoSettings.MEDIA_CONNECT_URI:
		disconnect(alias='media-db')
	disconnect()