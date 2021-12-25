import { AfterContentInit, Component, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild } from '@angular/core';
import { DynamicScriptLoaderService } from 'src/app/core/services/dynamic-script-loader/dynamic-script-loader.service';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { CartItem } from 'src/app/models/cart-item';
import { Coupon } from 'src/app/models/posts/coupon';
import { environment } from 'src/environments/environment';
import { CheckoutService } from '../../../services/checkout/checkout.service';

@Component({
	selector: 'sephira-stripe',
	templateUrl: './stripe.component.html',
	styleUrls: ['./stripe.component.scss'],
})
export class StripeComponent implements AfterContentInit {

	@Input() cartItems: CartItem[];
	@Output() paymentSuccess: EventEmitter<boolean>;

	@ViewChild('stripePayButton', { static: true }) private stripePayButton: ElementRef<HTMLButtonElement> | undefined;
	@ViewChild('stripeCardError', { static: true }) private stripeCardError: ElementRef<HTMLElement> | undefined;
	@ViewChild('stripeForm', { static: true }) private stripeForm: ElementRef<HTMLFormElement> | undefined;

	stripe: stripe.Stripe | null;
	orderID: string | null;
	coupons: Coupon[];

	private stripeCard: stripe.elements.Element | null;
	
	constructor(
		private platform: PlatformService,
		private checkout: CheckoutService,
		private scriptLoader: DynamicScriptLoaderService,
		private renderer: Renderer2
	) {
		this.cartItems = [];
		this.paymentSuccess = new EventEmitter<boolean>();
		this.stripe = null;
		this.orderID = null;
		this.coupons = [];
		this.stripeCard = null;
	}

	ngAfterContentInit(): void {
		if (this.platform.isBrowser) {
			this.scriptLoader.load('stripe').then(data => {
				if (data[0].loaded) {
					this.stripe = Stripe(environment.stripePublicKey);
					const elements = this.stripe.elements();
					const style = {
						base: {
							color: '#32325d',
							fontFamily: 'Arial, sans-serif',
							fontSmoothing: 'antialiased',
							fontSize: '16px',
							'::placeholder': {
								color: '#32325d'
							}
						},
						invalid: {
							fontFamily: 'Arial, sans-serif',
							color: '#fa755a',
							iconColor: '#fa755a'
						}
					};
					this.stripeCard = elements.create('card', { style });
					this.stripeCard.mount('#card-element');
					this.stripeCard.on('change', (event: any) => {
						if (event && event.error && this.stripePayButton && this.stripeCardError) {
							this.stripePayButton.nativeElement.disabled = event.empty;
							this.stripeCardError.nativeElement.textContent = event.error ? event.error.message : '';
						}
					})
				} else {
					throw new Error('`stripe` failed to load');
				}
			});
		}
	}

}
