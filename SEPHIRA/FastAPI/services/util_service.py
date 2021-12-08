def make_ngrams(word, min_size=2, prefix_only=False):
	'''
	Generate an ngram string for fuzzy searching
	'''
	length = len(word)
	size_range = range(min_size, max(length, min_size) + 1)
	if prefix_only:
		return [
			word[0:size]
			for size in size_range
		]
	return list(set(
		word[i:i + size]
		for size in size_range
		for i in range(0, max(0, length - size) + 1)
	))

def all_subclasses(cls):
	'''
	Recursively gets all subclasses of the given class
	'''
	return list(set(cls.__subclasses__()).union([s for c in cls.__subclasses__() for s in all_subclasses(c)]))

def is_post(cls):
	'''
	Check if the given class is a post type (exluding Post as it is abstract)
	'''
	from database.models import Post
	for post_type in all_subclasses(Post):
		if cls == post_type:
			return True
	return False

def base_model_to_clean_dict(model):
	'''
	Returns a `cleaned` dictionary (a dictionary with all None values removed) for easily exploding a BaseModel to a dictionary
	'''
	return { k: v for k, v, in model.dict().items() if v is not None }