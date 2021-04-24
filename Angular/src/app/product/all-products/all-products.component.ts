import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product';
import { ProductService } from '../product.service';

@Component({
	selector: 'app-all-products',
	templateUrl: './all-products.component.html',
	styleUrls: ['./all-products.component.scss']
})
export class AllProductsComponent implements OnInit {

	products: Product[];

	constructor(private productService: ProductService) {
		this.products = [];
	}

	ngOnInit(): void {
		this.productService.getAllProducts().toPromise().then(products => {
			this.products = products;
		});
	}



}
