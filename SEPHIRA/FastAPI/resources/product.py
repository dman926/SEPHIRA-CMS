from fastapi import APIRouter
from mongoengine.errors import DoesNotExist
from config import APISettings

from typing import Optional
from fastapi import Depends, Body
from pydantic import BaseModel
from modules.JWT.jwt import get_jwt_identity
from database.models import Order, Product, Review
from resources.errors import SchemaValidationError, UnauthorizedError

router = APIRouter(
	prefix=APISettings.ROUTE_BASE + 'product',
	tags=['Product']
)

###########
# SCHEMAS #
###########

class ReviewModel(BaseModel):
	score: float
	review: str

##########
# ROUTES #
##########

@router.get('/product/{id}/reviews')
async def get_reviews(id: str, page: Optional[int] = None, size: Optional[int] = None):
	try:
		reviews = Review.objects(product=id)
		if page == None:
			page = 0
			size = reviews.count()
		elif size == None:
			raise SchemaValidationError
		return { 'total': reviews.count(), 'reviews': list(map(lambda r: r.serialize(), reviews[page * size : page * size + size])) }
	except SchemaValidationError:
		raise SchemaValidationError().http_exception
	except Exception as e:
		raise e

@router.post('/product/{id}/reviews')
async def add_review(id: str, review: ReviewModel = Body(..., embed=True), identity: str = Depends(get_jwt_identity)):
	try:
		if Order.objects(orderer=identity, products__product=id, orderStatus__nin=['not placed', 'failed']).count() == 0:
			raise UnauthorizedError
		product = Product.objects.get(id=id)
		review = Review(reviewer=identity, product=id, score=review.score, review=review.review)
		review.save()
		product.addReview(review.score)
		product.save()
		return review.serialize()
	except UnauthorizedError:
		raise UnauthorizedError(detail='User has not purchased this product').http_exception
	except DoesNotExist:
		raise SchemaValidationError().http_exception
	except Exception as e:
		raise e

@router.get('/product/{id}/reviewAllowed')
async def get_review_allowed(id: str, identity: str = Depends(get_jwt_identity)):
	try:
		return Order.objects(orderer=identity, products__product=id, orderStatus__nin=['not placed', 'failed']).count() > 0
	except Exception as e:
		raise e