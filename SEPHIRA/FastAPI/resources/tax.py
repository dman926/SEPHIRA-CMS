from fastapi import APIRouter
from config import APISettings

from mongoengine.errors import DoesNotExist
from database.models import UsTaxJurisdiction
from resources.errors import NotFoundError

router = APIRouter(
	prefix=APISettings.ROUTE_BASE + 'tax',
	tags=['Tax']
)

###########
# SCHEMAS #
###########



##########
# ROUTES #
##########

@router.get('/us')
async def get_tax_rate(zip: str):
	try:
		tax_jurisdiction = UsTaxJurisdiction.objects.get(zip=zip)
		return tax_jurisdiction.serialize()
	except DoesNotExist:
		raise NotFoundError().http_exception
	except Exception as e:
		raise e