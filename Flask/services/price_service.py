def calculate_order_amount(items):
	total = 0
	for item in items:
		total += float(item.price) * item.qty
	return total

def calculate_discount_price(items, coupons):
	sortedCoupons = []
	for storeWide in [False, True]:
		for type in ['dollar', 'percent']:
			for coupon in coupons:
				if coupon.discountType == type and coupon.storeWide == storeWide:
					sortedCoupons.append(coupon)
	total = 0
	for item in items:
		currentPrice = float(item.price)
		for coupon in sortedCoupons:
			if str(item.product.id) in coupon.applicableProducts and not coupon.storeWide:
				if coupon.discountType == 'dollar':
					currentPrice -= coupon.discount
				elif coupon.discountType == 'percent':
					currentPrice -= currentPrice * (coupon.discount / 100.0)
		total += currentPrice * item.qty
	for coupon in sortedCoupons:
		if coupon.storeWide:
			if coupon.discountType == 'dollar':
				total -= coupon.discount
			elif coupon.discountType == 'percent':
				total -= total * (coupon.discount / 100.0)
	return total