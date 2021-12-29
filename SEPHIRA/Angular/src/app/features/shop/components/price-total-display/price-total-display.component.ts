import { Component, Input, OnInit } from '@angular/core';
import { CartItem } from 'src/app/models/cart-item';
import { Coupon } from 'src/app/models/posts/coupon';
import { ShippingRate, ShippingZone } from 'src/app/models/shipping-zone';
import { TaxRate } from 'src/app/models/tax-rate';

@Component({
	selector: 'sephira-price-total-display',
	templateUrl: './price-total-display.component.html',
	styleUrls: ['./price-total-display.component.scss'],
})
export class PriceTotalDisplayComponent implements OnInit {

	@Input() cartItems: CartItem[];
	@Input() coupons: Coupon[];
	@Input() taxRate: TaxRate | undefined;
	@Input() shippingZone: ShippingZone | undefined;
	@Input() minPrice: number;
	@Input() gateway: string;

	actualPrice: number;

	constructor() {
		this.cartItems = [];
		this.coupons = [];
		this.minPrice = 0;
		this.gateway = '';
		this.actualPrice = 0;
	}

	ngOnInit(): void {
		this.discountPrice; // generate value for actualPrice
	}

	get subtotal(): number {
		let total = 0;
		this.cartItems.forEach(item => {
			total += item.price * item.qty;
		});
		return Math.max(total, this.minPrice);
	}

	get discountPrice(): number {
		const sortedCoupons: Coupon[] = [];
		[false, true].forEach(storeWide => {
			['dollar', 'percent'].forEach(type => {
				this.coupons.forEach(coupon => {
					if (coupon.discountType === type && (coupon.storeWide === storeWide || (coupon.storeWide === undefined && storeWide === false))) {
						sortedCoupons.push(coupon);
					}
				});
			});
		});
		let total = 0;
		this.cartItems.forEach(item => {
			let currentPrice = item.price;
			sortedCoupons.forEach(coupon => {
				if (coupon.applicableProducts?.indexOf(item.id) !== -1 && !coupon.storeWide && coupon.discount) {
					if (coupon.discountType === 'dollar') {
						currentPrice -= coupon.discount;
					} else if (coupon.discountType === 'percent') {
						currentPrice -= currentPrice * (coupon.discount / 100.0);
					}
				}
			});
			total += currentPrice * item.qty;
		});
		sortedCoupons.forEach(coupon => {
			if (coupon.storeWide && coupon.discount) {
				if (coupon.discountType === 'dollar') {
					total -= coupon.discount;
				} else if (coupon.discountType === 'percent') {
					total -= total * (coupon.discount / 100.0);
				}
			}
		});
		this.actualPrice = total;
		return Math.max(total, this.minPrice);
	}

	get shippingAmount(): number {
		if (this.shippingZone?.rates) {
			const candidates: ShippingRate[] = [];
			const price = this.discountPrice;
			this.shippingZone.rates.forEach(rate => {
				if (((rate.minCutoff !== undefined && rate.minCutoff < price) || !rate.minCutoff) && ((rate.maxCutoff !== undefined && rate.maxCutoff > price) || !rate.maxCutoff)) {
					candidates.push(rate);
				}
			});
			let match: ShippingRate | null = null;
			candidates.forEach(candidate => {
				if (match === null) {
					match = candidate;
				} else {
					if (match.minCutoff === undefined && candidate.minCutoff !== undefined) {
						match = candidate;
					} else if (match.maxCutoff === undefined && candidate.maxCutoff !== undefined) {
						match = candidate;
					} else if (match.maxCutoff !== undefined && match.minCutoff !== undefined && candidate.maxCutoff !== undefined && candidate.minCutoff !== undefined && match.maxCutoff - match.minCutoff > candidate.maxCutoff - candidate.minCutoff) {
						match = candidate
					}
				}
			});
		}
		return 0;
	}

	get taxAmount(): number {
		if (this.taxRate) {
			return this.discountPrice * this.taxRate.estimatedCombinedRate
		}
		return 0;
	}

}
