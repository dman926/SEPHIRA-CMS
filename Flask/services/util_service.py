def make_ngrams(word, min_size=2, prefix_only=False):
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