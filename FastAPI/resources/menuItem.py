from fastapi import APIRouter
from config import API_SETTINGS

router = APIRouter(
	prefix=API_SETTINGS.ROUTE_BASE + 'menuItem',
	tags=['Menu Item']
)

###########
# SCHEMAS #
###########



##########
# ROUTES #
##########