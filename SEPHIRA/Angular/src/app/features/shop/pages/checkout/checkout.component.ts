import { Component, OnDestroy, OnInit } from '@angular/core';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { environment } from 'src/environments/environment';
import { CartService } from '../../services/cart/cart.service';
import { map, Observable, shareReplay, Subscription } from 'rxjs';
import { CartItem } from 'src/app/models/cart-item';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService } from 'src/app/features/auth/services/auth/auth.service';
import { ThemeService } from 'src/app/core/services/theme/theme.service';

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

	isHandset$: Observable<boolean> = this.breakpointObserver
		.observe(Breakpoints.Handset)
		.pipe(
			map((result) => result.matches),
			shareReplay()
		);

	selectedPaymentGateway: '' | 'stripe' | 'paypal' | 'coinbase' | 'nowpayments';
	showCheckoutButtons: boolean;
	cartItems: CartItem[];
	readonly enableStripe = environment.enableStripe;
	readonly enablePayPal = environment.enablePayPal;
	readonly enableCoinbaseCommerce = environment.enableCoinbaseCommerce;
	readonly enableNowPayments = environment.enableNowPayments;
	readonly requireLogIn = environment.requireLoggedInToCheckout;
	private cartSub: Subscription | null;

	constructor(
		public cart: CartService,
		public auth: AuthService,
		public theme: ThemeService,
		private platform: PlatformService,
		public router: Router,
		private iconRegistry: MatIconRegistry,
		private sanitizer: DomSanitizer,
		private breakpointObserver: BreakpointObserver,
	) {
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

	onPayment(id: string) {
		this.cart.clearCart();
		this.router.navigate(['/shop/checkout/placed'], { queryParams: { id } });
	}

}
