import { AfterContentInit, Component, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CoreService } from 'src/app/core/services/core/core.service';
import { DynamicScriptLoaderService } from 'src/app/core/services/dynamic-script-loader/dynamic-script-loader.service';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { CartItem } from 'src/app/models/cart-item';
import { AddressForm } from 'src/app/models/order';
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
	@Output() paymentSuccess: EventEmitter<string>;

	@ViewChild('stripePayButton', { static: true }) private stripePayButton: ElementRef<HTMLButtonElement> | undefined;
	@ViewChild('stripeCardError', { static: true }) private stripeCardError: ElementRef<HTMLElement> | undefined;
	@ViewChild('stripeForm', { static: true }) private stripeForm: ElementRef<HTMLFormElement> | undefined;

	stripe: stripe.Stripe | null;
	stripeReady: boolean;
	orderID: string | null;
	coupons: Coupon[];

	addressForm: FormGroup;
	billingForm: FormGroup;

	private stripeCard: stripe.elements.Element | null;
	
	constructor(
		private platform: PlatformService,
		private checkout: CheckoutService,
		private scriptLoader: DynamicScriptLoaderService,
		private core: CoreService,
		private renderer: Renderer2
	) {
		this.cartItems = [];
		this.paymentSuccess = new EventEmitter<string>();

		this.stripe = null;
		this.stripeReady = false;
		this.orderID = null;
		this.coupons = [];

		this.addressForm = new FormGroup({
			fullName: new FormControl('', [Validators.required]),
			country: new FormControl({ value: 'US', disabled: true }, [Validators.required]),
			street1: new FormControl('', [Validators.required]),
			street2: new FormControl(''),
			stateProvidenceRegion: new FormControl('', [Validators.required, this.core.stateCodeValidator()]),
			city: new FormControl('', [Validators.required]),
			zip: new FormControl('', [Validators.required, Validators.pattern('[0-9]{5}')]),
			phoneNumber: new FormControl('', [Validators.required])
		});
		this.billingForm = new FormGroup({
			email: new FormControl('', [Validators.required, Validators.email]),
			fullName: new FormControl('', [Validators.required]),
			country: new FormControl({ value: 'US', disabled: true }, [Validators.required]),
			street1: new FormControl('', [Validators.required]),
			street2: new FormControl(''),
			stateProvidenceRegion: new FormControl('', [Validators.required, this.core.stateCodeValidator()]),
			city: new FormControl('', [Validators.required]),
			zip: new FormControl('', [Validators.required, Validators.pattern('[0-9]{5}')]),
			phoneNumber: new FormControl('', [Validators.required])
		});

		this.stripeCard = null;
	}

	ngAfterContentInit(): void {
		if (this.platform.isBrowser && this.cartItems.length > 0) {
			this.scriptLoader.load('stripe').then(data => {
				if (data[0].loaded) {
					this.checkout.createOrder(this.cartItems, 'stripe').subscribe(orderID => {
						this.orderID = orderID;
					});
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
					});
					this.stripeReady = true;
				} else {
					throw new Error('`stripe` failed to load');
				}
			});
		}
	}

	createStripePaymentMethod(card: stripe.elements.Element): void {
		if (this.stripe && this.orderID) {
			const orderID = this.orderID;
			this.stripe.createPaymentMethod({
				type: 'card',
				card: card,
				billing_details: {
					address: {
						city: this.billingForm.get('city')!.value,
						country: this.billingForm.get('country')!.value,
						line1: this.billingForm.get('street1')!.value,
						line2: this.billingForm.get('street2')!.value,
						postal_code: this.billingForm.get('zip')!.value,
						state: this.billingForm.get('stateProvidenceRegion')!.value,
					},
					email: this.billingForm.get('email')!.value,
					name: this.billingForm.get('fullName')!.value,
					phone: this.billingForm.get('phoneNumber')!.value
				}
			}).then(res => {
				if (res.error) {
					// TODO: show error
					console.error(res.error);
				} else {
					if (res.paymentMethod) {
						const email = this.billingForm.get('email')!.value;
						const addresses = this.getAddressDetails();
						this.checkout.stripeCheckout(res.paymentMethod.id, email, addresses, orderID).subscribe(paymentRes => {
							if (paymentRes) {
								this.paymentSuccess.emit(orderID);
							}
						});
					}
				}
			});
		}
	}

	private getAddressDetails(): AddressForm {
		const addresses: AddressForm = {
			shipping: {
				name: this.addressForm.get('fullName')?.value,
				country: this.addressForm.get('country')?.value,
				street1: this.addressForm.get('street1')?.value,
				street2: this.addressForm.get('street2')?.value,
				region: this.addressForm.get('stateProvidenceRegion')?.value,
				city: this.addressForm.get('city')?.value,
				zip: this.addressForm.get('zip')?.value,
				phoneNumber: this.addressForm.get('phoneNumber')?.value
			},
			billing: {
				name: this.billingForm.get('fullName')?.value,
				country: this.billingForm.get('country')?.value,
				street1: this.billingForm.get('street1')?.value,
				street2: this.billingForm.get('street2')?.value,
				region: this.billingForm.get('stateProvidenceRegion')?.value,
				city: this.billingForm.get('city')?.value,
				zip: this.billingForm.get('zip')?.value,
				phoneNumber: this.billingForm.get('phoneNumber')?.value
			}
		};
		return addresses;
	}

}
