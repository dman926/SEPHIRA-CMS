import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from 'src/app/models/product';
import { CartService } from 'src/app/payment/cart/cart.service';
import { ProductService } from '../product.service';

@Component({
	selector: 'app-product',
	templateUrl: './product.component.html',
	styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {

	loaded: boolean;
	product: Product | undefined;

	selectedImg: number;

	constructor(private productService: ProductService, private router: Router, public cartService: CartService) {
		this.loaded = false;
		this.selectedImg = 0;
	}

	ngOnInit(): void {
		this.productService.getProduct(this.router.url.substr(5)).toPromise().then(product => {
			console.log(product);
			this.product = product;
			this.loaded = true;
		}).catch(err => this.loaded = true);
	}

}
