import { Component, Input } from '@angular/core';
import { CartItem } from 'src/app/models/cart-item';

@Component({
	selector: 'sephira-paypal',
	templateUrl: './paypal.component.html',
	styleUrls: ['./paypal.component.scss'],
})
export class PaypalComponent {

	@Input() cartItems: CartItem[];

	constructor() {
		this.cartItems = [];
	}

}
