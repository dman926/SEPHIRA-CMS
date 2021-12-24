import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CartService } from '../../services/cart/cart.service';

@Component({
	selector: 'sephira-cart',
	templateUrl: './cart.component.html',
	styleUrls: ['./cart.component.scss'],
})
export class CartComponent {

	constructor(public cart: CartService) { }

	reduceProduct(id: string, event: any): void {
		event.stopPropagation();
		this.cart.removeFromCart(id, 1);
	}

	increaseProduct(id: string, event: any): void {
		event.stopPropagation();
		this.cart.addToCart({ id });
	}

	get cartSize$(): Observable<number> {
		return this.cart.cart$.pipe(map(cart => {
			let size = 0;
			for (let cartItem of cart) {
				size += cartItem.qty;
			}
			return size;
		}));
	}

}
