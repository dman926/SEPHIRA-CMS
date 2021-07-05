import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Subscription, Observable, of } from 'rxjs';
import { debounceTime, take, map } from 'rxjs/operators';
import { Coupon } from 'src/app/models/coupon';
import { AdminService } from '../../admin.service';

@Component({
  selector: 'app-coupon',
  templateUrl: './coupon.component.html',
  styleUrls: ['./coupon.component.scss']
})
export class CouponComponent implements OnInit, OnDestroy {

	coupon: Coupon | undefined;

	couponGroup: FormGroup;
	saving: boolean;
	saved: boolean;

	readonly editorConfig: AngularEditorConfig = {
		editable: true,
		spellcheck: true,
		height: 'auto',
		minHeight: '0',
		maxHeight: 'auto',
		width: 'auto',
		minWidth: '0',
		translate: 'yes',
		enableToolbar: true,
		showToolbar: true,
		placeholder: 'Enter text here...',
		sanitize: false,
		toolbarPosition: 'top',
	};

	private subs: Subscription[];

	constructor(private adminService: AdminService, private route: ActivatedRoute, private router: Router) {
		this.subs = [];
		this.couponGroup = new FormGroup({
			title: new FormControl('', [Validators.required]),
			slug: new FormControl('', [Validators.required], [this.slugValidator()]),
			content: new FormControl(''),
			excerpt: new FormControl(''),
			status: new FormControl(''),
			categories: new FormArray([])
		});
		this.saving = false;
		this.saved = false;
	}

	ngOnInit(): void {
		this.subs.push(this.route.params.subscribe(params => {
			this.adminService.getCoupon(params.id).toPromise().then(coupon => {
				this.coupon = coupon;
				this.couponGroup.patchValue({
					title: coupon.title,
					slug: coupon.slug,
					content: coupon.content,
					excerpt: coupon.excerpt,
					status: coupon.status,
					categories: coupon.categories!.map(cat => new FormControl(cat, [Validators.required]))
				});
			}).catch(err => this.router.navigate(['/admin/coupons']));
		}));
	}

	ngOnDestroy(): void {
		this.subs.forEach(sub => sub.unsubscribe());
	}

	deleteCoupon(): void {
		if (this.coupon) {
			this.adminService.deleteCoupon(this.coupon.id!).toPromise().then(res => this.router.navigate(['/admin/coupons']));
		}
	}

	editCoupon(): void {
		if (this.coupon && this.couponGroup.valid) {
			const coupon: Coupon = {
				id: this.coupon.id,
				title: this.couponGroup.get('title')!.value,
				slug: this.couponGroup.get('slug')!.value,
				content: this.couponGroup.get('content')!.value,
				excerpt: this.couponGroup.get('excerpt')!.value,
				status: this.couponGroup.get('status')!.value,
				categories: this.couponGroup.get('categories')!.value,
			};
			this.saving = true;
			this.adminService.editCoupon(coupon).toPromise().then(res => {
				this.saving = false;
				this.saved = true;
				setTimeout(() => {
					this.saved = false;
				}, 3000);
			});
		}
	}

	addCategory(): void {
		if (this.categoriesArray.length < 20) {
			this.categoriesArray.push(new FormControl('', Validators.required));
		}
	}

	removeCategory(): void {
		this.categoriesArray.removeAt(this.categoriesArray.length - 1);
	}

	deleteProduct(): void {
		if (this.coupon) {
			this.adminService.deleteProduct(this.coupon.id!).toPromise().then(res => {
				this.router.navigate(['/admin/coupons']);
			})
		}
	}

	get slug(): FormControl {
		return this.couponGroup.get('slug')! as FormControl;
	}

	get categoriesArray() {
		return this.couponGroup.get('categories')! as FormArray;
	}

	private slugValidator(): AsyncValidatorFn {
		return (control: AbstractControl): Observable<ValidationErrors | null> => {
			if (this.coupon?.slug === control.value) {
				return of(null)
			} else {
				return this.adminService.checkCouponSlugTaken(control.value).pipe(
					debounceTime(500),
					take(1),
					map(res => !res ? { slugTaken: true } : null)
				);
			}
		};
	}

}