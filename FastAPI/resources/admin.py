from typing import Optional
from fastapi import APIRouter
from fastapi.params import Depends
from config import API_SETTINGS

from mongoengine.errors import DoesNotExist, FieldDoesNotExist, ValidationError
from modules.JWT import get_jwt_identity

import database.models as models
from resources.errors import InvalidPostTypeError, NotFoundError, UnauthorizedError, SchemaValidationError
from services.util_service import all_subclasses, is_post

from datetime import datetime

router = APIRouter(
	prefix=API_SETTINGS.ROUTE_BASE + 'admin',
	tags=['Admin']
)

###########
# HELPERS #
###########


def getAdminUser(identity: str) -> models.User:
	'''Get the user with given identity if they are admin, otherwise raise an appropriate error'''
	user = models.User.objects.get(id=identity)
	if user.admin:
		return user
	raise UnauthorizedError	

###########
# SCHEMAS #
###########



##########
# ROUTES #
##########

@router.get('/admin')
async def getIsAdmin(identity: str = Depends(get_jwt_identity)):
	try:
		user = getAdminUser(identity)
		return user.admin
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError(detail='User is not admin')
	except Exception as e:
		raise e

@router.get('/users')
async def getUsers(page: Optional[int] = None, size: Optional[int] = None, identity: str = Depends(get_jwt_identity)):
	try:
		user = getAdminUser(identity)
		users = models.User.objects
		if page == None:
			page = 0
			size = users.count()
		elif size == None:
			raise SchemaValidationError
		return { 'count': users.count(), 'users': list(map(lambda u: u.serialize(), users[page * size : page * size + size])) }
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError(detail='User is not admin')
	except SchemaValidationError:
		raise SchemaValidationError()
	except Exception as e:
		raise e

@router.get('/user/{id}')
async def getUser(id: str, identity: str = Depends(get_jwt_identity)):
	try:
		getAdminUser(identity)
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	except Exception as e:
		raise e
	try:
		user = models.User.objects.get(id=id)
		return user.serialize()
	except DoesNotExist:
		raise NotFoundError(detail='User with id ' + id + ' does not exist')
	except Exception as e:
		raise e

@router.put('/user/{id}')
async def getAdminUser(id: str, user: models.UserModel, identity: str = Depends(get_jwt_identity)):
	try:
		getAdminUser(identity)
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	except Exception as e:
		raise e
	try:
		models.User.objects.get(id=id).update(**user)
		return 'ok'
	except DoesNotExist:
		raise NotFoundError(detail='User with id ' + id + ' does not exist')
	except Exception as e:
		raise e

@router.delete('/user/{id}')
async def getAdminUser(id: str, identity: str = Depends(get_jwt_identity)):
	try:
		getAdminUser(identity)
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	except Exception as e:
		raise e
	try:
		models.User.objects.get(id=id).delete()
		return 'ok'
	except DoesNotExist:
		raise NotFoundError(detail='User with id ' + id + ' does not exist')
	except Exception as e:
		raise e

@router.get('/posts/types')
async def getAdminUser(identity: str = Depends(get_jwt_identity)):
	try:
		getAdminUser(identity)
		return list(map(lambda s: s.__module__[9:] + '.' + s.__name__, all_subclasses(models.Post)))
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	except Exception as e:
		raise e

@router.get('/posts/schema')
async def getAdmin(post: str, identity: str = Depends(get_jwt_identity)):
	try:
		getAdminUser(identity)
		try:
			postType = eval(post)
			if not is_post(postType):
				raise InvalidPostTypeError
		except Exception:
			raise InvalidPostTypeError
		return postType.schema()
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	except InvalidPostTypeError:
		raise InvalidPostTypeError()
	except Exception as e:
		raise e

@router.get('/posts')
async def getPosts(post: str, page: Optional[int] = None, size: Optional[int] = None, search: Optional[str] = None, identity: str = Depends(get_jwt_identity)):
	try:
		getAdminUser(identity)
		try:
			postType = eval(post)
			if not is_post(postType):
				raise InvalidPostTypeError
		except Exception:
			raise InvalidPostTypeError
		posts = postType.objects
		if search:
			posts.search_text(search).order_by('$text_score')
		if page == None:
			page = 0
			size = posts.count()
		elif size == None:
			raise SchemaValidationError
		return { 'count': posts.count(), 'users': list(map(lambda p: p.serialize(), posts[page * size : page * size + size])) }
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	except InvalidPostTypeError:
		raise InvalidPostTypeError()
	except Exception as e:
		raise e

@router.post('/posts')
async def addPost(post: str, obj: dict, identity: str = Depends(get_jwt_identity)):
	try:
		user = getAdminUser(identity)
		try:
			postType = eval(post)
			if not is_post(postType):
				raise InvalidPostTypeError
		except Exception:
			raise InvalidPostTypeError
		obj = postType(**obj)
		obj.author = user

		postTypeName = postType.__name__
		
		# Do any aditional logic here.
		# Just check with a simple `if postTypeName == POSTTYPENAME:` to see the class name coming in. Do not rely on the post variable

		obj.save()
		return obj.serialize()
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	except InvalidPostTypeError:
		raise InvalidPostTypeError()
	except (FieldDoesNotExist, ValidationError, SchemaValidationError):
			raise SchemaValidationError()
	except Exception as e:
		raise e

@router.get('/post/{id}')
async def getPost(post: str, id: str, withSchema: Optional[bool] = False, identity: str = Depends(get_jwt_identity)):
	try:
		getAdminUser(identity)
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	try:
		try:
			postType = eval(post)
			if not is_post(postType):
				raise InvalidPostTypeError
		except Exception:
			raise InvalidPostTypeError
		obj = postType.objects.get(id=id)
		out = { 'obj': obj.serialize() }
		if withSchema:
			out['schema'] = postType.schema()
		return out
	except DoesNotExist:
		raise NotFoundError()
	except InvalidPostTypeError:
		raise InvalidPostTypeError()
	except Exception as e:
		raise e

@router.put('/post/{id}')
async def updatePost(post: str, id: str, obj: dict, identity: str = Depends(get_jwt_identity)):
	try:
		getAdminUser(identity)
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	try:
		try:
			postType = eval(post)
			if not is_post(postType):
				raise InvalidPostTypeError
		except Exception:
			raise InvalidPostTypeError
		toUpdate = postType.objects.get(id=id)
		
		postTypeName = postType.__name__
		if postTypeName == 'Coupon':
			if obj['applicableProducts']:
					obj['applicableProducts'] = list(map(lambda p: models.Product.objects.get(id=p), obj['applicableProducts']))

		toUpdate.update(**obj)
		obj.reload()
		obj.modified = datetime.now
		obj.generateNgrams()
		obj.save()
		return 'ok'
	except DoesNotExist:
		raise NotFoundError()
	except InvalidPostTypeError:
		raise InvalidPostTypeError()
	except (FieldDoesNotExist, ValidationError, SchemaValidationError):
		raise SchemaValidationError()
	except Exception as e:
		raise e

@router.delete('/post/{id}')
async def deletePost(post: str, id: str, identity: str = Depends(get_jwt_identity)):
	try:
		getAdminUser(identity)
		try:
			postType = eval(post)
			if not is_post(postType):
				raise InvalidPostTypeError
		except Exception:
			raise InvalidPostTypeError
		postType.objects.get(id=id).delete()
		return 'ok'
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	except InvalidPostTypeError:
		raise InvalidPostTypeError()
	except Exception as e:
		raise e

@router.get('/posts/slugTaken')
async def isPostSlugTaken(post: str, slug: str, identity: str = Depends(get_jwt_identity)):
	try:
		getAdminUser(identity)
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	try:
		try:
			postType = eval(post)
			if not is_post(postType):
				raise InvalidPostTypeError
		except Exception:
			raise InvalidPostTypeError
		postType.objects.get(slug=slug)
		return False
	except DoesNotExist:
		return True
	except InvalidPostTypeError:
		raise InvalidPostTypeError()
	except Exception as e:
		raise e

@router.get('/orders')
async def getOrders(page: Optional[int] = None, size: Optional[int] = None, identity: str = Depends(get_jwt_identity)):
	try:
		getAdminUser(identity)
		orders = models.Order.objects
		if page == None:
			page = 0
			size = orders.count()
		elif size == None:
			raise SchemaValidationError
		return { 'count': orders.count(), 'users': list(map(lambda o: o.serialize(), orders[page * size : page * size + size])) }
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	except Exception as e:
		raise e

@router.get('/order/{id}')
async def getOrder(id: str, identity: str = Depends(get_jwt_identity)):
	try:
		getAdminUser(identity)
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	try:
		order = models.Order.objects.get(id=id)
		return order.serialize()
	except DoesNotExist:
		raise NotFoundError()
	except Exception as e:
		raise e

@router.put('/order/{id}')
async def editOrder(id: str, order: models.OrderModel, identity: str = Depends(get_jwt_identity)):
	try:
		getAdminUser(identity)
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	try:
		toUpdate = models.Order.objects.get(id=id)
		toUpdate.update(**order)
		toUpdate.reload()
		toUpdate.modified = datetime.now
		toUpdate.save()
		return 'ok'
	except DoesNotExist:
		raise NotFoundError()
	except Exception as e:
		raise e

@router.delete('/order/{id}')
async def deleteOrder(id: str, identity: str = Depends(get_jwt_identity)):
	try:
		getAdminUser(identity)
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	try:
		models.Order.objects.get(id=id).delete()
		return 'ok'
	except DoesNotExist:
		raise NotFoundError()
	except Exception as e:
		raise e

@router.get('/usShippingZones')
async def getUsShippingZones(page: Optional[int] = None, size: Optional[int] = None, identity: str = Depends(get_jwt_identity)):
	try:
		getAdminUser(identity)
		zones = models.UsShippingZone.objects
		if page == None:
			page = 0
			size = zones.count()
		elif size == None:
			raise SchemaValidationError
		return { 'count': zones.count(), 'users': list(map(lambda z: z.serialize(), zones[page * size : page * size + size])) }
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	except Exception as e:
		raise e

@router.post('/usShippingZones')
async def addUsShippingZone(shippingZone: models.UsShippingZoneModel, identity: str = Depends(get_jwt_identity)):
	try:
		getAdminUser(identity)
		zone = models.UsShippingZone(**shippingZone)
		try:
			models.UsShippingZone.objects.get(default=True)
		except DoesNotExist:
			zone.default = True
		zone.save()
		return zone.serialize()
	except ValidationError:
		raise SchemaValidationError()
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	except Exception as e:
		raise e

@router.get('/usShippingZone/{id}')
async def getOrder(id: str, identity: str = Depends(get_jwt_identity)):
	try:
		getAdminUser(identity)
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	try:
		zone = models.UsShippingZone.objects.get(id=id)
		return zone.serialize()
	except DoesNotExist:
		raise NotFoundError()
	except Exception as e:
		raise e

@router.put('/usShippingZone/{id}')
async def editOrder(id: str, shippingZone: models.UsShippingZoneModel, identity: str = Depends(get_jwt_identity)):
	try:
		getAdminUser(identity)
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	try:
		toUpdate = models.UsShippingZoneModel.objects.get(id=id)
		toUpdate.update(**shippingZone)
		return 'ok'
	except DoesNotExist:
		raise NotFoundError()
	except Exception as e:
		raise e

@router.delete('/usShippingZone/{id}')
async def deleteUsShippingZone(id: str, identity: str = Depends(get_jwt_identity)):
	try:
		getAdminUser(identity)
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	try:
		models.UsShippingZone.objects.get(id=id).delete()
		return 'ok'
	except DoesNotExist:
		raise NotFoundError()
	except Exception as e:
		raise e