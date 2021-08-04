import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CartService } from '../../cart/cart.service';
import { CartItem } from 'src/app/models/cart-item';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, map, startWith } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { DynamicScriptLoaderService } from 'src/app/core/services/dynamic-script-loader.service';
import { Coupon } from 'src/app/models/coupon';
import { MatChipInputEvent } from '@angular/material/chips';
import { ShippingZone } from 'src/app/models/shipping-zone';
import { CookieService } from 'ngx-cookie';
import { PlatformService } from 'src/app/core/services/platform.service';

declare var paypal: any;

interface Intent {
	clientSecret?: string;
	hosted_url?: string;
	clientToken?: string;
}

interface CountryPair {
	name: string;
	code: string;
}

interface CoinbaseRes {
	expires_at: string | Date;
	hosted_url: string;
}

interface TaxRate {
	estimatedCityRate: number;
	estimatedCombinedRate: number;
	esimatedCountyRate: number;
	estimatedSpecialRate: number;
	riskLevel: number;
	state: string;
	stateRate: number;
	taxRegion: string;
	zip: string;
}

interface ShippingRate {
	rate: number;
	type: string;
	minCutoff: number;
	maxCutoff: number;
}

@Component({
	selector: 'app-checkout',
	templateUrl: './checkout.component.html',
	styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {

	stripe: stripe.Stripe | null;
	products: CartItem[];
	coupons: Coupon[];
	stripeIntent: Intent | null;

	coinbaseCommerceRes: CoinbaseRes | null;

	addressForm: FormGroup;
	billingForm: FormGroup;

	countries: CountryPair[];
	filteredCountries: Observable<CountryPair[]>;
	filteredCountries2: Observable<CountryPair[]>;
	taxRate: TaxRate | null;
	shippingZone: ShippingZone | null;
	orderID: string | null;

	cantEdit: boolean;

	readonly separatorKeysCodes = [ENTER, COMMA] as const;

	private subs: Subscription[];

	constructor(private scriptLoader: DynamicScriptLoaderService, private http: HttpClient, private cartService: CartService, private router: Router, private platformService: PlatformService, private cookie: CookieService) {
		this.stripe = null;
		this.products = [];
		this.coupons = [];
		this.stripeIntent = null;

		this.coinbaseCommerceRes = null;

		this.cantEdit = false;

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

		this.countries = [];
		const countryControl = this.addressForm.get('country');
		const countryControl2 = this.billingForm.get('country');
		if (countryControl && countryControl2) {
			this.filteredCountries = countryControl.valueChanges.pipe(
				startWith(''),
				map(value => this._filter(value))
			);
			this.filteredCountries2 = countryControl2.valueChanges.pipe(
				startWith(''),
				map(value => this._filter(value))
			);
		} else {
			this.filteredCountries = new Observable<CountryPair[]>();
			this.filteredCountries2 = new Observable<CountryPair[]>();
		}
		this.taxRate = null;
		this.shippingZone = null;
		this.orderID = null;
		this.subs = [];
	}

	ngOnInit(): void {
		if (this.platformService.isBrowser()) {
			this.http.get<CountryPair[]>(window.location.origin + '/assets/country/countries.json').toPromise().then(res => {
				this.countries = res;
			});

			this.cartService.getCart().toPromise().then(cart => {
				this.products = cart;

				this.scriptLoader.load('stripe', 'paypal').then(data => {
					if (data[0].loaded) {
						this.stripe = Stripe(environment.stripePublicKey);
						const elements = this.stripe!.elements();
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
								// Disable the Pay button if there are no card details in the Element
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
						}, 250);
					} else {
						throw new Error('\'stripe\' failed to load');
					}
					if (!data[1].loaded) {
						throw new Error('\'paypal\' failed to load');
					}

					let headers = new HttpHeaders();
					const accessToken = this.cookie.get('accessToken');
					if (accessToken) {
						headers = headers.append('Authorization', 'Bearer ' + accessToken);
					}
					this.http.post<string>(environment.apiServer + 'order/orders', { products: this.products }, { headers }).toPromise().then(orderID => {
						this.orderID = orderID
					});
				});
			});

			this.subs.push(this.addressForm.get('stateProvidenceRegion')!.valueChanges.pipe(debounceTime(500)).subscribe(val => {
				if (this.addressForm.get('stateProvidenceRegion')!.valid) {
					const params = new HttpParams().append('state', val);
					this.http.get<ShippingZone>(environment.apiServer + 'shipping/us', { params }).toPromise().then(shippingZone => {
						this.shippingZone = shippingZone;
					}).catch(err => this.shippingZone = null);
				} else {
					this.shippingZone = null;
				}
			}));

			this.subs.push(this.addressForm.get('zip')!.valueChanges.pipe(debounceTime(500)).subscribe(val => {
				if (this.addressForm.get('zip')!.valid) {
					const params = new HttpParams().append('zip', val);
					this.http.get<TaxRate>(environment.apiServer + 'tax/us', { params }).toPromise().then(taxRate => {
						this.taxRate = taxRate;
					}).catch(err => this.taxRate = null);
				} else {
					this.taxRate = null;
				}
			}));
		}
	}

	ngOnDestroy(): void {
		this.subs.forEach(sub => sub.unsubscribe());
	}

	createStripePaymentMethod(card: any): void {
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
				console.log('failed');
			} else {
				this.submitPaymentMethod(res.paymentMethod!.id).toPromise().then(paymentRes => {
					this.cartService.clearCart();
					this.router.navigate(['/checkout/placed'], { queryParams: { id: paymentRes } });
				});
			}
		});
	}

	renderPaypalCoinbase(): void {
		let headers = new HttpHeaders();
		const accessToken = this.cookie.get('accessToken');
		if (accessToken) {
			headers = headers.append('Authorization', 'Bearer ' + accessToken);
		}
		document.getElementById('paypal-button-container')!.innerHTML = '';
		this.coinbaseCommerceRes = null;
		const orderID = this.orderID;
		this.http.put<string>(environment.apiServer + 'order/order/' + orderID, { addresses: this.getAddressDetails(), coupons: this.coupons }, { headers }).toPromise().then(res => {
			paypal.Buttons({
				createOrder: async (data: any, actions: any) => {
					const res = await this.http.post(environment.apiServer + 'payment/paypal/checkout', { orderID, location: window.location.protocol + '//' + window.location.hostname + ':' + window.location.port }, { headers }).toPromise();
					return res;
				},
				onApprove: async (data: any, actions: any) => {
					const res = await this.http.post(environment.apiServer + 'payment/paypal/capture', { orderID: data.orderID }, { headers }).toPromise();
					this.cartService.clearCart();
					this.router.navigate(['/checkout/placed'], { queryParams: { id: res } });
				}
			}).render('#paypal-button-container');
			this.http.post<CoinbaseRes>(environment.apiServer + 'payment/coinbase/checkout', { orderID, location: window.location.protocol + '//' + window.location.hostname + ':' + window.location.port }, { headers }).pipe(map(res => {
				res.expires_at = new Date(res.expires_at);
				return res;
			})).toPromise().then(res => {
				this.coinbaseCommerceRes = res
			});
		});
	}

	private submitPaymentMethod(paymentMethodID: any): Observable<any> {
		const accessToken = this.cookie.get('accessToken');
		let headers = new HttpHeaders();
		if (accessToken) {
			headers = headers.append('Authorization', 'Bearer ' + accessToken);
		}
		const email = this.billingForm.get('email')!.value;
		const addresses = this.getAddressDetails();
		return this.http.post<string>(environment.apiServer + 'payment/stripe/checkout', { paymentMethodID, email, addresses, orderID: this.orderID }, { headers });
	}

	addCoupon(event: MatChipInputEvent): void {
		for (let i = 0; i < this.coupons.length; i++) {
			if (this.coupons[i].code === event.value.trim()) {
				return;
			}
		}
		this.http.post<Coupon>(environment.apiServer + 'cart/couponCheck', { code: event.value.trim(), cart: this.products }).toPromise().then(coupon => {
			if (coupon) {
				this.coupons.push(coupon);
			}
			event.chipInput!.clear();
		});
	}

	removeCoupon(coupon: Coupon): void {
		this.coupons.splice(this.coupons.indexOf(coupon), 1);
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
		return total;
	}

	get now(): Date {
		return new Date();
	}

	get shippingAmount(): number {
		if (this.shippingZone) {
			const candidates: ShippingRate[] = [];
			const price = this.calcDiscountPrice();
			for (let i = 0; i < this.shippingZone.rates!.length; i++) {
				const rate = this.shippingZone.rates![i];
				if (((rate.minCutoff !== null && rate.minCutoff < price) || rate.minCutoff === null) && ((rate.maxCutoff !== null && rate.maxCutoff > price) || rate.maxCutoff === null)) {
					candidates.push(rate);
				}
			}
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

	private getAddressDetails() {
		const addresses = {
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

	private _filter(value: string): CountryPair[] {
		const filterValue = value.toLowerCase();
		return this.countries.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
	}

}
