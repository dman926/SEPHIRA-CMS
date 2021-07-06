import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Subscription, Observable, of } from 'rxjs';
import { debounceTime, take, map } from 'rxjs/operators';
import { Coupon } from 'src/app/models/coupon';
import { Product } from 'src/app/models/product';
import { AdminService } from '../../admin.service';

interface PageEvent {
	length: number;
	pageIndex: number;
	pageSize: number;
	previousPageIndex?: number;
}

@Component({
  selector: 'app-coupon',
  templateUrl: './coupon.component.html',
  styleUrls: ['./coupon.component.scss']
})
export class CouponComponent implements OnInit, OnDestroy {

	coupon: Coupon | undefined;

	products: Product[];
	productPageEvent: PageEvent;
	productCount: number;
	loaded: boolean;

	couponGroup: FormGroup;
	applicableProducts: string[];
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
		this.products = [];
		this.productPageEvent = {
			length: 0,
			pageIndex: 0,
			pageSize: 10,
			previousPageIndex: 0
		};
		this.productCount = 0;
		this.loaded = false;
		this.couponGroup = new FormGroup({
			title: new FormControl('', [Validators.required]),
			slug: new FormControl('', [Validators.required], [this.slugValidator()]),
			content: new FormControl(''),
			excerpt: new FormControl(''),
			status: new FormControl(''),
			categories: new FormArray([]),
			storeWide: new FormControl('')
		});
		this.applicableProducts = [];
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
					categories: coupon.categories!.map(cat => new FormControl(cat, [Validators.required])),
					storeWide: coupon.storeWide
				});
				this.applicableProducts = coupon.applicableProducts!;
				console.log(this.applicableProducts);
			}).catch(err => this.router.navigate(['/admin/coupons']));
		}));
		this.adminService.getProductCount().toPromise().then(count => this.productCount = count);
		this.fetchProducts();
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
				storeWide: this.couponGroup.get('storeWide')!.value
			};
			if (!coupon.storeWide) {
				coupon.applicableProducts = this.applicableProducts;
			}
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

	get shownProducts(): Product[] {
		const index = this.productPageEvent.pageIndex;
		const size = this.productPageEvent.pageSize;
		return this.products.slice(index * size, index * size + size);
	}

	fetchProducts(event?: PageEvent): void {
		if (event) {
			this.productPageEvent = event;
		}
		this.loaded = false;
		this.adminService.getAllProducts(this.productPageEvent.pageIndex, this.productPageEvent.pageSize).toPromise().then(products => {
			this.products = this.products.concat(products);
			this.loaded = true;
		}).catch(err => this.loaded = true);
	}

	productSelectedChange(event: MatCheckboxChange, product: Product): void {
		const index = this.applicableProducts.indexOf(product.id!)
		if (index == -1 && event.checked) {
			this.applicableProducts.push(product.id!);
		} else if (!event.checked) {
			this.applicableProducts.splice(index, 1);
		}
		console.log(this.applicableProducts);
	}

	get slug(): FormControl {
		return this.couponGroup.get('slug')! as FormControl;
	}

	get categoriesArray(): FormArray {
		return this.couponGroup.get('categories')! as FormArray;
	}

	get storeWide(): boolean {
		return this.couponGroup.get('storeWide')!.value;
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