import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, take, map } from 'rxjs/operators';
import { Product } from 'src/app/models/product';
import { AdminService } from '../../admin.service';

interface PageEvent {
	length: number;
	pageIndex: number;
	pageSize: number;
	previousPageIndex?: number;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

	loaded: boolean;
	products: Product[];

	productPageEvent: PageEvent;
	productCount: number;

	newProductGroup: FormGroup;

	constructor(private admin: AdminService) {
		this.loaded = false;
		this.products = [];
		this.productPageEvent = {
			length: 0,
			pageIndex: 0,
			pageSize: 10,
			previousPageIndex: 0
		};
		this.productCount = 0;
		this.newProductGroup = new FormGroup({
			title: new FormControl('', [Validators.required]),
			slug: new FormControl('', [Validators.required], [this.slugValidator()]),
		});
	}

	ngOnInit(): void {
		this.admin.getProductCount().toPromise().then(count => {
			this.productCount = count;
		});
		this.fetchProducts();
	}

	get shownProducts(): Product[] {
		const index = this.productPageEvent.pageIndex;
		const size = this.productPageEvent.pageSize;
		return this.products.slice(index * size, index * size + size);
	}

	newProduct(): void {
		if (this.newProductGroup.valid) {
			const product: Product = {
				title: this.newProductGroup.get('title')!.value,
				slug: this.newProductGroup.get('slug')!.value,
			}
			if (product.slug!.substr(0, 1) !== '/') {
				product.slug = '/' + product.slug;
			}
			this.admin.submitProduct(product).toPromise().then(product => {
				this.products.unshift(product);
			})
		}
	}

	fetchProducts(event?: PageEvent): void {
		if (event) {
			this.productPageEvent = event;
		}
		this.loaded = false;
		this.admin.getAllProducts(this.productPageEvent.pageIndex, this.productPageEvent.pageSize).toPromise().then(products => {
			this.products = this.products.concat(products);
			this.loaded = true;
		}).catch(err => this.loaded = true);
	}

	get slug(): FormControl {
		return this.newProductGroup.get('slug')! as FormControl;
	}

	private slugValidator(): AsyncValidatorFn {
		return (control: AbstractControl): Observable<ValidationErrors | null> => {
			return this.admin.checkProductSlugTaken(control.value).pipe(
				debounceTime(500),
				take(1),
				map(res => !res ? { slugTaken: true } : null)
			);
		};
	}

}
