import { Component, Input, OnDestroy, OnInit } from '@angular/core';
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

}
