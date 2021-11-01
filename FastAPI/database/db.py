'''
MongoEngine connector
'''

from mongoengine import connect, disconnect
from config import MONGO_SETTINGS
from .models import UsTaxJurisdiction

def initialize_db():
	connect(host=MONGO_SETTINGS.CONNECT_URI)

	if UsTaxJurisdiction.objects.count() == 0:
		from json import load
		# Load the US tax jurisdictions if they do not exist
		taxJurisdictions = open('database/us_tax_jurisdiction.json', 'r')
		taxJurisdictions = load(taxJurisdictions)
		for taxJurisdiction in taxJurisdictions:
			UsTaxJurisdiction(**taxJurisdiction).save()

def close_db():
	disconnect()