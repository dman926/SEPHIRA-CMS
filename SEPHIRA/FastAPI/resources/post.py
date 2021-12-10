from fastapi import APIRouter
from config import APISettings

from typing import Optional
from services.util_service import is_post
from mongoengine.errors import DoesNotExist
from resources.errors import InvalidPostTypeError, NotFoundError, SchemaValidationError
import database.models as models

router = APIRouter(
	prefix=APISettings.ROUTE_BASE + 'post',
	tags=['Post']
)

###########
# SCHEMAS #
###########



##########
# ROUTES #
##########

@router.get('/posts')
async def get_posts(post: str, page: Optional[int] = None, size: Optional[int] = None, search: Optional[str] = None):
	try:
		print('fire 1')
		try:
			postType = eval(post)
		except Exception:
			raise InvalidPostTypeError
		if not is_post(postType):
			raise InvalidPostTypeError
		posts = postType.objects()
		if search:
			posts = posts.search_text(search).order_by('$text_score')
		if page == None:
			page = 0
			size = posts.count()
		elif size == None:
			raise SchemaValidationError
		return { 'total': posts.count(), 'posts': list(map(lambda p: p.serialize(), posts[page * size : page * size + size])) }
	except InvalidPostTypeError:
		print('fire')
		raise InvalidPostTypeError().http_exception
	except SchemaValidationError:
		raise SchemaValidationError().http_exception
	except Exception as e:
		raise e

@router.get('/post/id')
async def get_post(post: str, id: str):
	try:
		try:
			postType = eval(post)
		except Exception:
			raise InvalidPostTypeError
		if not is_post(postType):
			raise InvalidPostTypeError
		post = postType.objects.get(id=id)
		return post.serialize()
	except DoesNotExist:
		raise NotFoundError().http_exception
	except InvalidPostTypeError:
		raise InvalidPostTypeError().http_exception
	except Exception as e:
		raise e

@router.get('/post/slug')
async def get_post_from_slug(post: str, slug: str):
	try:
		try:
			postType = eval(post)
		except Exception:
			raise InvalidPostTypeError
		if not is_post(postType):
			raise InvalidPostTypeError
		post = postType.objects.get(slug=slug)
		return post.serialize()
	except DoesNotExist:
		raise NotFoundError().http_exception
	except InvalidPostTypeError:
		raise InvalidPostTypeError().http_exception
	except Exception as e:
		raise e

@router.get('/posts/slugTaken')
async def is_post_slug_taken(post: str, slug: str):
	try:
		try:
			postType = eval(post)
			if not is_post(postType):
				raise InvalidPostTypeError
		except Exception:
			raise InvalidPostTypeError
		foundPost = postType.objects.get(slug=slug)
		return str(foundPost.id)
	except DoesNotExist:
		return True
	except InvalidPostTypeError:
		raise InvalidPostTypeError()
	except Exception as e:
		raise e