import { Component, OnDestroy, OnInit } from '@angular/core';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { environment } from 'src/environments/environment';
import { CartService } from '../../services/cart/cart.service';
import { Subscription } from 'rxjs';
import { CartItem } from 'src/app/models/cart-item';

@Component({
	selector: 'sephira-checkout',
	templateUrl: './checkout.component.html',
	styleUrls: ['./checkout.component.scss'],
	animations: [
		trigger('switchTrigger', [
			state('fadeIn', style({ opacity: '1' })),
			transition('void => *', [style({ opacity: '0' }), animate('500ms')])
		])
	]
})
export class CheckoutComponent implements OnInit, OnDestroy {

	selectedPaymentGateway: '' | 'stripe' | 'paypal' | 'coinbase' | 'nowpayments';
	showCheckoutButtons: boolean;
	cartItems: CartItem[];
	readonly enableStripe = environment.enableStripe;
	readonly enablePayPal = environment.enablePayPal;
	readonly enableCoinbaseCommerce = environment.enableCoinbaseCommerce;
	readonly enableNowPayments = environment.enableNowPayments;
	private cartSub: Subscription | null;

	constructor(public cart: CartService, private platform: PlatformService, private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {
		this.selectedPaymentGateway = '';
		this.cartItems = [];
		this.cartSub = null;
		// Work around SSR not loading icons correctly
		// Besides, SSRed page should not be able to checkout. Only checkout from browser
		if (this.platform.isServer) {
			this.showCheckoutButtons = false;
		} else {
			this.iconRegistry.addSvgIcon('stripe', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/img/Payment Gateways/Stripe/Stripe wordmark - blurple.svg'));
			this.iconRegistry.addSvgIcon('paypal', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/img/Payment Gateways/PayPal/PayPal.svg'));
			this.iconRegistry.addSvgIcon('coinbase', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/img/Payment Gateways/Coinbase/Coinbase_Wordmark.svg'));
			this.showCheckoutButtons = true;
		}
	}

	ngOnInit(): void {
		this.cartSub = this.cart.cart$.subscribe(cartItems => {
			// Only update the cart if not in a payment gateway
			if (this.selectedPaymentGateway === '') {
				this.cartItems = cartItems;
			}
		})
	}

	ngOnDestroy(): void {
		this.cartSub?.unsubscribe();		
	}

}
