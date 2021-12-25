import { Component } from '@angular/core';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { environment } from 'src/environments/environment';
import { CartService } from '../../services/cart/cart.service';

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
export class CheckoutComponent {

	selectedPaymentGateway: '' | 'stripe' | 'paypal' | 'coinbase' | 'nowpayments';
	showCheckoutButtons: boolean;
	readonly enableStripe = environment.enableStripe;
	readonly enablePayPal = environment.enablePayPal;
	readonly enableCoinbaseCommerce = environment.enableCoinbaseCommerce;
	readonly enableNowPayments = environment.enableNowPayments;

	constructor(public cart: CartService, private platform: PlatformService, private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {
		this.selectedPaymentGateway = '';
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

}
