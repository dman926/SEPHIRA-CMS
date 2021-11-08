from fastapi import APIRouter
from config import APISettings

from mongoengine.errors import DoesNotExist
from database.models import UsShippingZone
from resources.errors import NotFoundError

router = APIRouter(
	prefix=APISettings.ROUTE_BASE + 'shipping',
	tags=['Shipping']
)

###########
# SCHEMAS #
###########



##########
# ROUTES #
##########

@router.get('/us')
async def get_us_shipping_rate(state: str):
	try:
		shipping_zone = UsShippingZone.objects.get(applicableStates=state)
		return shipping_zone.serialize()
	except DoesNotExist:
		try:
			shipping_zone = UsShippingZone.objects.get(default=True)
			return shipping_zone.serialize()
		except DoesNotExist:
			raise NotFoundError().http_exception
	except Exception as e:
		raise e