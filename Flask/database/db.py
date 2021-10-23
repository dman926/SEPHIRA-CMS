'''
Holds MongoEngine wrapper
'''

from mongoengine import connect

from .models import UsTaxJurisdiction
from json import load

def initialize_db(app):
	connect(host=app.config['MONGODB_SETTINGS'])

	if UsTaxJurisdiction.objects.count() == 0:
		# Load the US tax jurisdictions if they do not exist
		taxJurisdictions = open('database/us_tax_jurisdiction.json', 'r')
		taxJurisdictions = load(taxJurisdictions)
		for taxJurisdiction in taxJurisdictions:
			UsTaxJurisdiction(**taxJurisdiction).save()