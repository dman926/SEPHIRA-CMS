import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from 'src/app/models/product';
import { ProductService } from '../product.service';

@Component({
	selector: 'app-product',
	templateUrl: './product.component.html',
	styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {

	loaded: boolean;
	product: Product | undefined;

	constructor(private productService: ProductService, private router: Router) {
		this.loaded = false;
	}

	ngOnInit(): void {
		this.productService.getProduct(this.router.url.substr(5)).toPromise().then(product => {
			console.log(product);
			this.product = product;
			this.loaded = true;
		}).catch(err => this.loaded = true);
	}

}
