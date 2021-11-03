from fastapi import APIRouter
from config import API_SETTINGS

router = APIRouter(
	prefix=API_SETTINGS.ROUTE_BASE + 'coinbase',
	tags=['Coinbase']
)

###########
# SCHEMAS #
###########



##########
# ROUTES #
##########