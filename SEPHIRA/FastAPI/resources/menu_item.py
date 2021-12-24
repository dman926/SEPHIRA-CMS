from fastapi import APIRouter
from config import APISettings

from database.models import MenuItem

router = APIRouter(
	prefix=APISettings.ROUTE_BASE + 'menuItems',
	tags=['Menu Item']
)

###########
# SCHEMAS #
###########



##########
# ROUTES #
##########

@router.get('')
async def get_menu_items():
	try:
		return list(map(lambda mi: mi.serialize(), MenuItem.objects()))
	except Exception as e:
		raise e