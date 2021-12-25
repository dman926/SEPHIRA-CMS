import { Component, Input } from '@angular/core';
import { CartItem } from 'src/app/models/cart-item';

@Component({
	selector: 'sephira-coinbase',
	templateUrl: './coinbase.component.html',
	styleUrls: ['./coinbase.component.scss'],
})
export class CoinbaseComponent {

	@Input() cartItems: CartItem[];

	constructor() {
		this.cartItems = [];
	}

}
