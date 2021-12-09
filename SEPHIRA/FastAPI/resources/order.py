from fastapi import APIRouter
from config import APISettings

from typing import Optional
from fastapi import Depends
from modules.JWT.jwt import get_jwt_identity, get_jwt_identity_optional
from mongoengine.errors import DoesNotExist
from resources.errors import NotFoundError, SchemaValidationError
from database.models import CartItem, CartItemIDModel, Coupon, Order, OrderModel, Product, UsShippingZone, UsTaxJurisdiction

router = APIRouter(
	prefix=APISettings.ROUTE_BASE + 'order',
	tags=['Order']
)

###########
# SCHEMAS #
###########



##########
# ROUTES #
##########

@router.get('/orders')
async def get_orders(page: Optional[int] = None, size: Optional[int] = None, identity: str = Depends(get_jwt_identity)):
	try:
		orders = Order.objects(orderer=identity)
		total = orders.count()
		if page == None:
			page = 0
			size = total
		elif size == None:
			raise SchemaValidationError
		orders = orders[page * size : page * size + size]
		return { 'total': total, 'orders': list(map(lambda o: o.serialize(), orders)) }
	except SchemaValidationError:
		raise SchemaValidationError().http_exception
	except Exception as e:
		raise e

@router.post('/orders')
async def create_order(products: list[CartItemIDModel], identity: Optional[str] = Depends(get_jwt_identity_optional)):
	try:
		products = []
		for p in products:
			product = Product.objects.get(id=p.id)
			products.append(CartItem(product=product, qty=p.qty, price=product.price))
		order = Order(orderer=identity, orderStatus='not placed', products=products)
		order.save()
		return str(order.id)
	except DoesNotExist:
		raise SchemaValidationError().http_exception
	except Exception as e:
		raise e

@router.get('/order/{id}')
async def get_order(id: str, identity: Optional[str] = Depends(get_jwt_identity_optional)):
	try:
		order = Order.objects.get(id=id, orderer=identity)
		if identity:
			return order.serialize()
		else:
			return { 'orderStatus': order.orderStatus }
	except DoesNotExist:
		raise NotFoundError().http_exception
	except Exception as e:
		raise e

@router.put('/order/{id}')
async def modify_order(id: str, order_body: OrderModel, identity: Optional[str] = Depends(get_jwt_identity_optional)):
	try:
		order = Order.objects.get(id=id, orderer=identity)
		if order_body.addresses:
			taxJurisdiction = UsTaxJurisdiction.objects.get(zip=order_body.addresses['billing']['zip'])
			shippingZone = None
			try:
				shippingZone = UsShippingZone.objects.get(applicableStates=order_body.addresses['shipping']['region'])
			except DoesNotExist:
				shippingZone = UsShippingZone.objects.get(default=True)
			rateCandidate = []
			# TODO: Calculate order tax and shipping rates
		if order_body.coupons:
			coupons = list(map(lambda c: Coupon.objects.get(id=c), order_body.coupons))
			order.update(coupons=coupons)
		return 'ok'
	except DoesNotExist:
		raise NotFoundError().http_exception
	except Exception as e:
		raise e