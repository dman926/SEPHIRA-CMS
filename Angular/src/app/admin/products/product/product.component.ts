import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormArray, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Observable, of, Subscription } from 'rxjs';
import { debounceTime, take, map } from 'rxjs/operators';
import { Product } from 'src/app/models/product';
import { AdminService } from '../../admin.service';

@Component({
	selector: 'app-product',
	templateUrl: './product.component.html',
	styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit, OnDestroy {

	product: Product | undefined;

	productGroup: FormGroup;
	imgBrowserOpen: boolean;
	images: string[];
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
		this.productGroup = new FormGroup({
			title: new FormControl('', [Validators.required]),
			slug: new FormControl('', [Validators.required], [this.slugValidator()]),
			content: new FormControl(''),
			excerpt: new FormControl(''),
			status: new FormControl(''),
			sku: new FormControl(''),
			price: new FormControl('', [Validators.required]),
			categories: new FormArray([])
		});
		this.imgBrowserOpen = false;
		this.images = [];
		this.saving = false;
		this.saved = false;
	}

	ngOnInit(): void {
		this.subs.push(this.route.params.subscribe(params => {
			this.adminService.getProduct(params.id).toPromise().then(product => {
				this.product = product;
				console.log(product);
				this.productGroup.patchValue({
					title: product.title,
					slug: product.slug,
					content: product.content,
					excerpt: product.excerpt,
					status: product.status,
					sku: product.sku,
					price: product.price,
					categories: product.categories!.map(cat => new FormControl(cat, [Validators.required]))
				});
			}).catch(err => this.router.navigate(['/admin/products']));
		}));
	}

	ngOnDestroy(): void {
		this.subs.forEach(sub => sub.unsubscribe());
	}

	editProduct(): void {
		if (this.product && this.productGroup.valid) {
			const product: Product = {
				id: this.product.id,
				title: this.productGroup.get('title')!.value,
				slug: this.productGroup.get('slug')!.value,
				content: this.productGroup.get('content')!.value,
				excerpt: this.productGroup.get('excerpt')!.value,
				status: this.productGroup.get('status')!.value,
				sku: this.productGroup.get('sku')!.value,
				price: this.productGroup.get('price')!.value,
				categories: this.productGroup.get('categories')!.value,
			};
			console.log(product);
			this.saving = true;
			this.adminService.editProduct(product).toPromise().then(res => {
				this.saving = false;
				this.saved = true;
				setTimeout(() => {
					this.saved = false;
				}, 3000);
			});
		}
	}

	setImage(event: string): void {
		const foundAt = this.images.indexOf(event);
		if (foundAt === -1) {
			this.images.push(event);
		} else {
			this.images.splice(foundAt, 1);
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
		if (this.product) {
			this.adminService.deleteProduct(this.product.id!).toPromise().then(res => {
				this.router.navigate(['/admin/products']);
			})
		}
	}

	get slug(): FormControl {
		return this.productGroup.get('slug')! as FormControl;
	}

	get categoriesArray() {
		return this.productGroup.get('categories')! as FormArray;
	}

	private slugValidator(): AsyncValidatorFn {
		return (control: AbstractControl): Observable<ValidationErrors | null> => {
			if (this.product?.slug === control.value) {
				return of(null)
			} else {
				return this.adminService.checkProductSlugTaken(control.value).pipe(
					debounceTime(500),
					take(1),
					map(res => !res ? { slugTaken: true } : null)
				);
			}
		};
	}

}
