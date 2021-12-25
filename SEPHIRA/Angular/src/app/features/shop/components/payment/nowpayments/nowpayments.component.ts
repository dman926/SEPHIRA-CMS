import { Component, Input } from '@angular/core';
import { CartItem } from 'src/app/models/cart-item';

@Component({
	selector: 'sephira-nowpayments',
	templateUrl: './nowpayments.component.html',
	styleUrls: ['./nowpayments.component.scss'],
})
export class NowpaymentsComponent {

	@Input() cartItems: CartItem[];

	constructor() {
		this.cartItems = [];
	}

}
