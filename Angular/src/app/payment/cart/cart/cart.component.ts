import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { CartItem } from 'src/app/models/cart-item';
import { Product } from 'src/app/models/product';
import { CartService } from '../cart.service';

interface CartProduct {
	product: Product;
	qty: number;
}

@Component({
	selector: 'app-cart',
	templateUrl: './cart.component.html',
	styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

	@Input() appearance: string;

	products: CartItem[];
	cartSize: number;

	private firstPass: boolean;

	constructor(private cartService: CartService, private http: HttpClient) {
		this.appearance = '';
		this.products = [];
		this.cartSize = 0;
		this.firstPass = true;
	}

	ngOnInit(): void {
		this.cartService.cart$.subscribe(cart => {
			this.cartSize = 0;
			for (let i = 0; i < cart.length; i++) {
				this.cartSize += cart[i].qty;
			}
			if (this.firstPass) {
				this.firstPass = false;
				const builtLocalStorage: CartItem[] = [];
				this.cartService.getCart().toPromise().then(products => {
					if (products) {
						this.products = products;
						localStorage.setItem('cart', JSON.stringify(products));
					}
				});
			} else {
				this.products = cart;
			}
		});
	}

	reduceProduct(id: string, event: any): void {
		event.stopPropagation();
		this.cartService.removeFromCart(id, 1);
	}

}
