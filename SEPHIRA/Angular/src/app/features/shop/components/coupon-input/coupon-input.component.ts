import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { Coupon } from 'src/app/models/posts/coupon';
import { CartService } from '../../services/cart/cart.service';


@Component({
	selector: 'sephira-coupon-input',
	templateUrl: './coupon-input.component.html',
	styleUrls: ['./coupon-input.component.scss'],
})
export class CouponInputComponent implements OnInit {

	@Input() orderID: string | undefined;
	@Output() couponEmitter: EventEmitter<Coupon[]>;

	coupons: Coupon[];

	constructor(private cart: CartService) {
		this.couponEmitter = new EventEmitter<Coupon[]>();
		this.coupons = [];
	}

	ngOnInit(): void {
		if (!this.orderID) {
			throw new Error('`orderID` is a required input.');
		}
	}

	addCoupon(event: MatChipInputEvent): void {
		if (this.orderID) {
			for (let i = 0; i < this.coupons.length; i++) {
				if (this.coupons[i].code === event.value.trim()) {
					return;
				}
			}
			this.cart.addCoupon(this.orderID, event.value.trim()).subscribe(coupon => {
				if (coupon) {
					this.coupons.push(coupon);
					this.couponEmitter.emit(this.coupons);
				}
				event.chipInput?.clear();
			});
		} else {
			event.chipInput?.clear();
		}
	}

	removeCoupon(coupon: Coupon): void {
		const location = this.coupons.indexOf(coupon);
		if (location !== -1) {
			this.coupons.splice(location, 1);
			this.couponEmitter.emit(this.coupons);
		}
	}

}
