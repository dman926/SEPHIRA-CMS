import { Component, OnInit } from '@angular/core';
import { FormControl, AsyncValidatorFn, AbstractControl, ValidationErrors, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, take, map } from 'rxjs/operators';
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

	newCouponGroup: FormGroup;
	
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
		this.newCouponGroup = new FormGroup({
			title: new FormControl('', [Validators.required]),
			slug: new FormControl('', [Validators.required], [this.slugValidator()])
		});
	}

	ngOnInit(): void {
		this.admin.getCouponCount().toPromise().then(count => {
			this.couponCount = count;
		});
		this.fetchCoupons();
	}

	newCoupon(): void {
		if (this.newCouponGroup.valid) {
			const coupon: Coupon = {
				title: this.newCouponGroup.get('title')!.value,
				slug: this.newCouponGroup.get('slug')!.value
			}
			if (coupon.slug!.substr(0, 1) !== '/') {
				coupon.slug = '/' + coupon.slug;
			}
			this.admin.submitCoupon(coupon).toPromise().then(coupon => {
				this.coupons.unshift(coupon);
			})
		}
	}

	get shownCoupons(): Coupon[] {
		const index = this.couponPageEvent.pageIndex;
		const size = this.couponPageEvent.pageSize;
		return this.coupons.slice(index * size, index * size + size);
	}

	fetchCoupons(event?: PageEvent): void {
		if (event) {
			this.couponPageEvent = event;
			if (event.pageIndex * event.pageSize < this.coupons.length) {
				return;
			}
		}
		this.loaded = false;
		this.admin.getAllCoupons(this.couponPageEvent.pageIndex, this.couponPageEvent.pageSize).toPromise().then(coupons => {
			this.coupons = this.coupons.concat(coupons);
			this.loaded = true;
		}).catch(err => this.loaded = true);
	}

	get slug(): FormControl {
		return this.newCouponGroup.get('slug')! as FormControl;
	}

	private slugValidator(): AsyncValidatorFn {
		return (control: AbstractControl): Observable<ValidationErrors | null> => {
			return this.admin.checkPageSlugTaken(control.value).pipe(
				debounceTime(500),
				take(1),
				map(res => !res ? { slugTaken: true } : null)
			);
		};
	}

}
