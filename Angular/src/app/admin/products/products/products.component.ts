import { Component, OnInit } from '@angular/core';
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

}