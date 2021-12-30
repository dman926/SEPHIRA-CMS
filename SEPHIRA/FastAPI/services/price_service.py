from database.models import Order, CartItem

def calculate_order_discount(order: Order) -> float:
	total = 0
	for item in order.products:
		total += float(item.price) * item.qty
	return total - calculate_order_subtotal(order)

def calculate_order_subtotal(order: Order) -> float:
	sortedCoupons = []
	for storeWide in [False, True]:
		for discountType in ['dollar', 'percent']:
			for coupon in order.coupons:
				if coupon.discountType == discountType and coupon.storeWide == storeWide:
					sortedCoupons.append(coupon)
		
		total = 0
		for item in order.products:
			currentPrice = float(item.price)
			for coupon in sortedCoupons:
				if not coupon.storeWide and str(item.product.id) in coupon.applicableProducts:
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

def calculate_order_shipping(order: Order) -> float:
	if order.shippingType == 'dollar':
		return order.shippingRate
	elif order.shippingRate == 'percent':
		return calculate_order_subtotal(order) * (order.shippingRate / 100.0)
	return 0

def calculate_order_tax(order: Order) -> float:
	return calculate_order_subtotal(order) * order.taxRate

def calculate_order_total(order: Order) -> float:
	return calculate_order_subtotal(order) + calculate_order_shipping(order) + calculate_order_tax(order)

def check_stock(order: Order) -> bool:
	for item in order.products:
		if item.product.hasStock and item.product.stock < item.qty:
			return False
	return True

def remove_stock(order: Order) -> bool:
	if check_stock(order):
		for item in order.products:
			if item.product.hasStock:
				item.product.stock -= item.qty
				item.product.save()
		return True
	return False

def add_stock(order: Order) -> None:
	for item in order.products:
		if item.product.hasStock:
			item.product.stock += item.qty
			item.product.save()