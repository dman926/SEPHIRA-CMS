from database.models import Product

from app import app

def calculate_order_amount(items):
	total = 0
	for item in items:
		try:
			total += float(item.product.price) * item.qty
		except Exception as e:
			writeWarningToLog('Unhandled exception in services.util_service.calculate_order_amount', e)
	return total

def calculate_discount_price(items, coupons):
	sortedCoupons = []
	for type in ['dollar', 'percent']:
		for coupon in coupons:
			if coupon.discountType == type:
				sortedCoupons.append(coupon)
	total = 0
	for item in items:
		currentPrice = float(item.product.price)
		for coupon in sortedCoupons:
			if str(item.product.id) in coupon.applicableProducts:
				if coupon.discountType == 'dollar':
					currentPrice -= coupon.discount
				elif coupon.discountType == 'percent':
					currentPrice -= currentPrice * (coupon.discount / 100.0)
		total += currentPrice * item.qty
	return total	

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