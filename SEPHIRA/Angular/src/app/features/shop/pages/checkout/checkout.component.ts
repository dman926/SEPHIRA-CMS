import { COMMA, ENTER, P } from '@angular/cdk/keycodes';
import { AfterContentInit, Component, OnInit } from '@angular/core';
import { CartItem } from 'src/app/models/cart-item';
import { Coupon } from 'src/app/models/posts/coupon';
import { CheckoutService, CoinbaseRes } from '../../services/checkout/checkout.service';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { TaxRate } from 'src/app/models/tax-rate';
import { ShippingRate, ShippingZone } from 'src/app/models/shipping-zone';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { DynamicScriptLoaderService } from 'src/app/core/services/dynamic-script-loader/dynamic-script-loader.service';
import { environment } from 'src/environments/environment';
import { CartService } from '../../services/cart/cart.service';
import { debounceTime, EMPTY, map, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AddressForm } from 'src/app/models/order';
import { MatChipInputEvent } from '@angular/material/chips';

declare var paypal: any;

interface Intent {
	clientSecret?: string;
	hosted_url?: string;
	clientToken?: string;
}

@Component({
	selector: 'sephira-checkout',
	templateUrl: './checkout.component.html',
	styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit, AfterContentInit {

	products: CartItem[];
	coupons: Coupon[];

	stripe: stripe.Stripe | null;
	stripeIntent: Intent | null;

	coinbaseCommerceRes: CoinbaseRes | null;

	addressForm: FormGroup;
	billingForm: FormGroup;

	taxRate: TaxRate | null;
	shippingRates: ShippingRate[] | null;
	orderID: string | null;

	canEdit: boolean;

	stripeReady: boolean;
	paypalReady: boolean;

	readonly separatorKeyCodes = [ENTER, COMMA] as const;

	private readonly requireLogin: boolean = environment.requireLoggedInToCheckout;
	private readonly enableStripe: boolean = environment.enableStripe;
	private readonly enablePayPal: boolean = environment.enablePayPal;
	private readonly enableCoinbaseCommerce: boolean = environment.enableCoinbaseCommerce;
	
	constructor(private cart: CartService, private checkout: CheckoutService, private platform: PlatformService, private scriptLoader: DynamicScriptLoaderService, private router: Router) {
		this.products = [];
		this.coupons = [];
		this.stripe = null;
		this.stripeIntent = null;
		this.coinbaseCommerceRes = null;
		this.addressForm = new FormGroup({
			fullName: new FormControl('', [Validators.required]),
			country: new FormControl({ value: 'US', disabled: true }, [Validators.required]),
			street1: new FormControl('', [Validators.required]),
			street2: new FormControl(''),
			stateProvidenceRegion: new FormControl('', [Validators.required, this.stateCodeValidator()]),
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
			stateProvidenceRegion: new FormControl('', [Validators.required, this.stateCodeValidator()]),
			city: new FormControl('', [Validators.required]),
			zip: new FormControl('', [Validators.required, Validators.pattern('[0-9]{5}')]),
			phoneNumber: new FormControl('', [Validators.required])
		});
		this.taxRate = null;
		this.shippingRates = null;
		this.orderID = null;
		this.canEdit = false;
		this.stripeReady = false;
		this.paypalReady = false;
	}

	ngOnInit(): void {
		if (this.platform.isBrowser) {
			// TODO: I don't know if I want to subscribe to the local or server cart
			this.cart.getCart().subscribe(cart => {
				this.products = cart;
			});
			if (this.enablePayPal) {
				this.scriptLoader.load('paypal').then(data => {
					this.paypalReady = data[0].loaded;
					if (!this.paypalReady) {
						throw new Error('`paypal` failed to load');
					}
				});
			}
		}
	}

	ngAfterContentInit(): void {
		if (this.platform.isBrowser) {
			if (this.enableStripe) {
				this.scriptLoader.load('stripe').then(data => {
					this.stripeReady = data[0].loaded;
					if (this.stripeReady) {
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
						const card = elements.create('card', { style });
						setTimeout(() => {
							card.mount('#card-element');
							card.on('change', event => {
								// Disable the Pay button if there are no card details in the Card Element
								const button = document.querySelector('button');
								const cardError = document.querySelector('#card-error');
								if (event && event.error && button && cardError) {
									button.disabled = event.empty;
									cardError.textContent = event.error ? event.error.message ? event.error.message : null : '';
								}
							});
							const form = document.getElementById('stripe-payment-form');
							if (form) {
								form.addEventListener('submit', event => {
									event.preventDefault();
									// Complete payment when the submit button is clicked
									this.createStripePaymentMethod(card);
								});
							}
						});
					} else {
						throw new Error('`stripe` failed to load');
					}
				});
			}
			this.checkout.createOrder(this.products).subscribe(orderID => {
				this.orderID = orderID;
			});
			
			const addressState = this.addressForm.get('stateProvidenceRegion')!;
			addressState.valueChanges.pipe(
				debounceTime(500)
			).subscribe(val => {
				if (addressState.valid) {
					this.checkout.getShippingRate('us', val).subscribe({
						next: rates => {
							this.shippingRates = rates;
						},
						error: err => this.shippingRates = null
					});
				} else {
					this.shippingRates = null;
				}
			});

			const addressZIP = this.addressForm.get('zip')!;
			addressZIP.valueChanges.pipe(
				debounceTime(500)
			).subscribe(val => {
				if (addressZIP.valid) {
					this.checkout.getTaxRate('us', val).subscribe({
						next: rate => {
							this.taxRate = rate;
						},
						error: err => this.taxRate = null
					});
				} else {
					this.taxRate = null;
				}
			});
		}
	}

	createStripePaymentMethod(card: stripe.elements.Element): void {
		this.stripe!.createPaymentMethod({
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
				this.submitPaymentMethod(res.paymentMethod!.id).subscribe(paymentRes => {
					this.onApprove(paymentRes);
				});
			}
		});
	}

	renderPayPalCoinbase(): void {
		const orderID = this.orderID;
		if (!orderID) {
			return;
		}
		const returnLoc = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port;
		document.getElementById('paypal-butotn-container')!.innerHTML = '';
		this.coinbaseCommerceRes = null;
		this.checkout.editOrder(orderID, this.products, this.getAddressDetails(), this.coupons).subscribe(res => {
			paypal.Buttons({
				createOrder: async (data: any, actions: any) => {
					return this.checkout.paypalCheckout(orderID, returnLoc).subscribe();
				},
				onApprove: async (data: any, actions: any) => {
					this.checkout.paypalCapture(orderID).subscribe(res => {
						this.onApprove(res);
					});
				}
			}).render('#apaypal-button-container');
			this.checkout.getCoinbaseCommerceRes(orderID, returnLoc).pipe(map(res => {
				res.expires_at = new Date(res.expires_at);
				return res;
			})).subscribe(res => {
				this.coinbaseCommerceRes = res;
			});
		});
	}

	addCoupon(event: MatChipInputEvent): void {
		if (this.orderID) {
			for (let i = 0; i < this.coupons.length; i++) {
				if (this.coupons[i].code === event.value.trim()) {
					return;
				}
			}
			this.cart.addCoupon(this.orderID, event.value).subscribe(coupon => {
				if (coupon) {
					this.coupons.push(coupon);
				}
				event.chipInput!.clear();
			});
		} else {
			event.chipInput!.clear();
		}
	}

	removeCoupon(coupon: Coupon): void {
		const location = this.coupons.indexOf(coupon);
		if (location !== -1) {
			this.coupons.splice(location, 1);
		}
	}

	calcSubtotal(): number {
		let total = 0;
		this.products.forEach(product => {
			total += product.price * product.qty;
		});
		if (total < .5) {
			total = .5;
		}
		return total;
	}

	calcDiscountPrice(): number {
		const sortedCoupons: Coupon[] = [];
		[false, true].forEach(storeWide => {
			['dollar', 'percent'].forEach(type => {
				this.coupons.forEach(coupon => {
					if (coupon.discountType === type && coupon.storeWide === storeWide) {
						sortedCoupons.push(coupon);
					}
				});
			});
		});
		let total = 0;
		this.products.forEach(product => {
			let currentPrice = product.price;
			sortedCoupons.forEach(coupon => {
				if (coupon.applicableProducts!.indexOf(product.id) !== -1 && !coupon.storeWide) {
					if (coupon.discountType === 'dollar') {
						currentPrice -= coupon.discount!;
					} else if (coupon.discountType === 'percent') {
						currentPrice -= currentPrice * (coupon.discount! / 100.0);
					}
				}
			});
			total += currentPrice * product.qty;
		});
		sortedCoupons.forEach(coupon => {
			if (coupon.storeWide) {
				if (coupon.discountType === 'dollar') {
					total -= coupon.discount!;
				} else if (coupon.discountType === 'percent') {
					total -= total * (coupon.discount! / 100.0);
				}
			}
		});
		if (total < 0.5) {
			total = 0.5
		}
		return total;
	}

	get now(): Date {
		return new Date();
	}

	get shippingAmount(): number {
		if (this.shippingRates) {
			const candidates: ShippingRate[] = [];
			const price = this.calcDiscountPrice();
			this.shippingRates.forEach(rate => {
				if (((rate.minCutoff !== null && rate.minCutoff < price) || rate.minCutoff === null) && ((rate.maxCutoff !== null && rate.maxCutoff > price) || rate.maxCutoff === null)) {
					candidates.push(rate);
				}
			});
			let match: any = null; // There's a bug where you can't declare this as a specific type
			candidates.forEach(candidate => {
				if (match === null) {
					match = candidate;
				} else {
					if (match.minCutoff === null && candidate.minCutoff !== null) {
						match = candidate;
					} else if (match.maxCutoff === null && candidate.maxCutoff !== null) {
						match = candidate;
					} else if (match.maxCutoff - match.minCutoff > candidate.maxCutoff - candidate.minCutoff) {
						match = candidate;
					}
				}
			});
			if (match) {
				if (match.type === 'dollar') {
					return match.rate;
				} else if (match.type === 'percent') {
					return price * match.rate;
				}
			}
		}
		return 0;
	}

	private onApprove(id: string): void {
		this.cart.clearCart();
		this.router.navigate(['/shop/checkout/placed'], { queryParams: { id } });
	}

	private submitPaymentMethod(paymentMethodID: string): Observable<string> {
		if (this.orderID) {
			const email = this.billingForm.get('email')!.value;
			const addresses = this.getAddressDetails();
			return this.checkout.stripeCheckout(paymentMethodID, email, addresses, this.orderID);
		}
		return EMPTY;
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

	private stateCodeValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const states = [
				"AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DC", "DE", "FL", "GA", 
				"HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", 
				"MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
				"NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", 
				"SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
			];
			return states.indexOf(control.value) === -1 ? { invalidState: true } : null;
		}
	}

}
