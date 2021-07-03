import { Component, OnInit } from '@angular/core';
import { Coupon } from 'src/app/models/coupon';
import { AdminService } from '../../admin.service';

interface PageEvent {
	length: number;
	pageIndex: number;
	pageSize: number;
	previousPageIndex?: number;
}

@Component({
  selector: 'app-coupons',
  templateUrl: './coupons.component.html',
  styleUrls: ['./coupons.component.scss']
})
export class CouponsComponent implements OnInit {

	loaded: boolean;
	coupons: Coupon[];

	couponPageEvent: PageEvent;
	couponCount: number;

	constructor(private admin: AdminService) {
		this.loaded = false;
		this.coupons = [];
		this.couponPageEvent = {
			length: 0,
			pageIndex: 0,
			pageSize: 10,
			previousPageIndex: 0
		};
		this.couponCount = 0;
	}

	ngOnInit(): void {
		this.admin.getCouponCount().toPromise().then(count => {
			this.couponCount = count;
		});
		this.fetchCoupons();
	}

	get shownCoupons(): Coupon[] {
		const index = this.couponPageEvent.pageIndex;
		const size = this.couponPageEvent.pageSize;
		return this.coupons.slice(index * size, index * size + size);
	}

	fetchCoupons(event?: PageEvent): void {
		if (event) {
			this.couponPageEvent = event;
		}
		this.loaded = false;
		this.admin.getAllCoupons(this.couponPageEvent.pageIndex, this.couponPageEvent.pageSize).toPromise().then(coupons => {
			this.coupons = this.coupons.concat(coupons);
			this.loaded = true;
		}).catch(err => this.loaded = true);
	}

}
