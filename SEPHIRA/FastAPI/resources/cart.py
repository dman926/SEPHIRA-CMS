from fastapi import APIRouter, Depends, Body
from mongoengine.errors import DoesNotExist
from pydantic import BaseModel
from config import APISettings

from modules.JWT import get_jwt_identity

from database.models import Product, Coupon, User, CartItemIDModel

router = APIRouter(
	prefix=APISettings.ROUTE_BASE + 'cart',
	tags=['Cart']
)

###########
# SCHEMAS #
###########

class CouponCheckForm(BaseModel):
	code: str
	cart: list[CartItemIDModel]

##########
# ROUTES #
##########

@router.get('/cart')
async def get_cart(identity: str = Depends(get_jwt_identity)):
	try:
		user = User.objects.get(id=identity)
		return list(map(lambda p: p.serialize(), user.cart))
	except Exception as e:
		raise e

@router.put('/cart')
async def update_cart(cart: list[CartItemIDModel] = Body(..., embed=True), identity: str = Depends(get_jwt_identity)):
	try:
		user = User.objects.get(id=identity)
		for i in range(0, len(cart)):
			cart[i] = {
				'product': Product.objects.get(id=cart[i].id),
				'qty': cart[i].qty
			}
		user.update(cart=cart)
		user.save()
		return 'ok'
	except Exception as e:
		raise e

@router.post('/couponCheck')
async def check_coupon(coupon_check_body: CouponCheckForm):
	try:
		coupon = Coupon.objects.get(code=coupon_check_body.code)
		if coupon.storeWide:
			return coupon.serialize()
		if coupon.maxUses != -1 and coupon.maxUses < coupon.uses:
			return False
		for item in coupon_check_body.cart:
			try:
				product = Product.objects.get(id=item.id)
				if product in coupon.appplicableProducts:
					return coupon.serialize()
			except Exception:
				continue
		return False
	except DoesNotExist:
		return False
	except Exception as e:
		raise e