from typing import Optional
from fastapi import APIRouter, Depends, Body
from pydantic.main import BaseModel
from config import APISettings

from mongoengine.errors import DoesNotExist, FieldDoesNotExist, ValidationError
from modules.JWT import get_jwt_identity

import database.models as models
from resources.errors import InvalidPostTypeError, NotFoundError, UnauthorizedError, SchemaValidationError
from services.util_service import all_subclasses, is_post, base_model_to_clean_dict, class_name_to_class

from datetime import datetime

router = APIRouter(
	prefix=APISettings.ROUTE_BASE + 'admin',
	tags=['Admin']
)

###########
# HELPERS #
###########

def get_admin_user(identity: str) -> models.User:
	'''Get the user with given identity if they are admin, otherwise raise an appropriate error'''
	user = models.User.objects.get(id=identity)
	if user.admin:
		return user
	raise UnauthorizedError	

###########
# SCHEMAS #
###########

class PostForm(BaseModel):
	post: str
	obj: dict


class MenuItemForm(BaseModel):
	menuItems: list[models.MenuItemModel]

##########
# ROUTES #
##########

@router.get('/admin')
async def get_is_admin(identity: str = Depends(get_jwt_identity)):
	try:
		user = get_admin_user(identity)
		return user.admin
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError(detail='User is not admin')
	except Exception as e:
		raise e

@router.get('/users')
async def get_users(page: Optional[int] = None, size: Optional[int] = None, identity: str = Depends(get_jwt_identity)):
	try:
		user = get_admin_user(identity)
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
async def get_user(id: str, identity: str = Depends(get_jwt_identity)):
	try:
		get_admin_user(identity)
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
async def update_user(id: str, user: models.UserModel, identity: str = Depends(get_jwt_identity)):
	try:
		get_admin_user(identity)
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	except Exception as e:
		raise e
	try:
		models.User.objects.get(id=id).update(**base_model_to_clean_dict(user))
		return 'ok'
	except DoesNotExist:
		raise NotFoundError(detail='User with id ' + id + ' does not exist')
	except Exception as e:
		raise e

@router.delete('/user/{id}')
async def delete_user(id: str, identity: str = Depends(get_jwt_identity)):
	try:
		get_admin_user(identity)
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
async def get_post_types(identity: str = Depends(get_jwt_identity)):
	try:
		get_admin_user(identity)
		return list(map(lambda s: s.__module__[9:] + '.' + s.__name__, all_subclasses(models.Post)))
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	except Exception as e:
		raise e

@router.get('/posts/schema')
async def get_post_schema(post: str, identity: str = Depends(get_jwt_identity)):
	try:
		get_admin_user(identity)
		try:
			postType = class_name_to_class(__name__, post)
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
async def get_posts(post: str, page: Optional[int] = None, size: Optional[int] = None, search: Optional[str] = None, identity: str = Depends(get_jwt_identity)):
	try:
		get_admin_user(identity)
		try:
			postType = class_name_to_class(__name__, post)
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
		return { 'count': posts.count(), 'posts': list(map(lambda p: p.serialize(), posts[page * size : page * size + size])) }
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	except InvalidPostTypeError:
		raise InvalidPostTypeError()
	except Exception as e:
		raise e

@router.post('/posts')
async def add_post(post_body: PostForm, identity: str = Depends(get_jwt_identity)):
	try:
		user = get_admin_user(identity)
		try:
			postType = class_name_to_class(__name__, post_body.post)
			if not is_post(postType):
				raise InvalidPostTypeError
		except Exception:
			raise InvalidPostTypeError
		obj = postType(**post_body.obj)
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
async def get_post(post: str, id: str, withSchema: Optional[bool] = False, identity: str = Depends(get_jwt_identity)):
	try:
		get_admin_user(identity)
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	try:
		try:
			postType = class_name_to_class(__name__, post)
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
async def update_post(id: str, post_body: PostForm, identity: str = Depends(get_jwt_identity)):
	try:
		get_admin_user(identity)
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	try:
		try:
			postType = class_name_to_class(__name__, post_body.post)
			if not is_post(postType):
				raise InvalidPostTypeError
		except Exception:
			raise InvalidPostTypeError
		toUpdate = postType.objects.get(id=id)
		
		postTypeName = postType.__name__
		if postTypeName == 'Coupon':
			if post_body.obj['applicableProducts']:
					post_body.obj['applicableProducts'] = list(map(lambda p: models.Product.objects.get(id=p), post_body.obj['applicableProducts']))

		toUpdate.update(**post_body.obj)
		toUpdate.reload()
		toUpdate.modified = datetime.now
		toUpdate.generateNgrams()
		toUpdate.save()
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
async def delete_post(post: str, id: str, identity: str = Depends(get_jwt_identity)):
	try:
		get_admin_user(identity)
		try:
			postType = class_name_to_class(__name__, post)
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
async def is_post_slug_taken(post: str, slug: str, identity: str = Depends(get_jwt_identity)):
	try:
		get_admin_user(identity)
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	try:
		try:
			postType = class_name_to_class(__name__, post)
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
async def get_orders(page: Optional[int] = None, size: Optional[int] = None, identity: str = Depends(get_jwt_identity)):
	try:
		get_admin_user(identity)
		orders = models.Order.objects
		if page == None:
			page = 0
			size = orders.count()
		elif size == None:
			raise SchemaValidationError
		return { 'count': orders.count(), 'orders': list(map(lambda o: o.serialize(), orders[page * size : page * size + size])) }
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	except Exception as e:
		raise e

@router.get('/order/{id}')
async def get_order(id: str, identity: str = Depends(get_jwt_identity)):
	try:
		get_admin_user(identity)
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
async def edit_order(id: str, order: models.OrderModel, identity: str = Depends(get_jwt_identity)):
	try:
		get_admin_user(identity)
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	try:
		toUpdate = models.Order.objects.get(id=id)
		toUpdate.update(**base_model_to_clean_dict(order))
		toUpdate.reload()
		toUpdate.modified = datetime.now
		toUpdate.save()
		return 'ok'
	except DoesNotExist:
		raise NotFoundError()
	except Exception as e:
		raise e

@router.delete('/order/{id}')
async def delete_order(id: str, identity: str = Depends(get_jwt_identity)):
	try:
		get_admin_user(identity)
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
async def get_us_shipping_zones(page: Optional[int] = None, size: Optional[int] = None, identity: str = Depends(get_jwt_identity)):
	try:
		get_admin_user(identity)
		zones = models.UsShippingZone.objects
		if page == None:
			page = 0
			size = zones.count()
		elif size == None:
			raise SchemaValidationError
		return { 'count': zones.count(), 'shippingZones': list(map(lambda z: z.serialize(), zones[page * size : page * size + size])) }
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	except Exception as e:
		raise e

@router.post('/usShippingZones')
async def add_us_shipping_zone(shippingZone: models.UsShippingZoneModel, identity: str = Depends(get_jwt_identity)):
	try:
		get_admin_user(identity)
		zone = models.UsShippingZone(**base_model_to_clean_dict(shippingZone))
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
async def get_us_shipping_zone(id: str, identity: str = Depends(get_jwt_identity)):
	try:
		get_admin_user(identity)
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
async def update_us_shipping_zone(id: str, shippingZone: models.UsShippingZoneModel, identity: str = Depends(get_jwt_identity)):
	try:
		get_admin_user(identity)
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	try:
		toUpdate = models.UsShippingZone.objects.get(id=id)
		toUpdate.update(**base_model_to_clean_dict(shippingZone))
		return 'ok'
	except DoesNotExist:
		raise NotFoundError()
	except Exception as e:
		raise e

@router.delete('/usShippingZone/{id}')
async def delete_us_shipping_zone(id: str, identity: str = Depends(get_jwt_identity)):
	try:
		get_admin_user(identity)
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	try:
		models.UsShippingZone.objects.get(id=id).delete()
		return 'ok'
	except DoesNotExist:
		raise NotFoundError()
	except Exception as e:
		raise e

@router.get('/menuItems')
async def get_menu_items(identity: str = Depends(get_jwt_identity)):
	try:
		get_admin_user(identity)
		return list(map(lambda m: m.serialize(), models.MenuItem.objects()))
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	except Exception as e:
		raise e

@router.post('/menuItems')
async def save_menu_items(menuItems: MenuItemForm, identity: str = Depends(get_jwt_identity)):
	try:
		get_admin_user(identity)
		models.MenuItem.objects().delete() # remove all old menu items
		for item in menuItems.menuItems:
			models.MenuItem(**base_model_to_clean_dict(item)).save()
		return 'ok'
	except (DoesNotExist, UnauthorizedError):
		raise UnauthorizedError('User is not admin')
	except Exception as e:
		raise e
