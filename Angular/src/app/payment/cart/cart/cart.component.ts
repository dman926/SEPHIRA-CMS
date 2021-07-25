import { HttpClient } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PlatformService } from 'src/app/core/services/platform.service';
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
export class CartComponent implements OnInit, OnDestroy {

	@Input() appearance: string;

	products: CartItem[];
	cartSize: number;

	private firstPass: boolean;
	private subs: Subscription[];

	constructor(private cartService: CartService, private platformService: PlatformService) {
		this.appearance = '';
		this.products = [];
		this.cartSize = 0;
		this.firstPass = true;
		this.subs = [];
	}

	ngOnInit(): void {
		if (this.platformService.isBrowser()) {
			this.subs.push(this.cartService.cart$.subscribe(cart => {
				this.cartSize = 0;
				if (cart) {
					for (let i = 0; i < cart.length; i++) {
						this.cartSize += cart[i].qty;
					}
					if (this.firstPass) {
						this.firstPass = false;
						this.cartService.getCart().toPromise().then(products => {
							if (products) {
								this.products = products;
								localStorage.setItem('cart', JSON.stringify(products));
							}
						}).catch(err => localStorage.setItem('cart', '[]'));
					} else {
						this.products = cart;
					}
				} else {
					this.products = [];
				}
			}));	
		}		
	}

	ngOnDestroy(): void {
		this.subs.forEach(sub => sub.unsubscribe());
	}

	reduceProduct(id: string, event: any): void {
		event.stopPropagation();
		this.cartService.removeFromCart(id, 1);
	}

	increaseProduct(id: string, event: any): void {
		event.stopPropagation();
		this.cartService.addToCart({ id });
	}

}
