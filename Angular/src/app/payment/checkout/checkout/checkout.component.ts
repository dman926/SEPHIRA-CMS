import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CartService } from '../../cart/cart.service';
import { CartItem } from 'src/app/models/cart-item';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { DynamicScriptLoaderService } from 'src/app/core/services/dynamic-script-loader.service';
import { Coupon } from 'src/app/models/coupon';
import { MatChipInputEvent } from '@angular/material/chips';

interface Intent {
	clientSecret?: string;
	hosted_url?: string;
	clientToken?: string;
}

interface CountryPair {
	name: string;
	code: string;
}

interface Id {
	id: string;
}

@Component({
	selector: 'app-checkout',
	templateUrl: './checkout.component.html',
	styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

	stripe: stripe.Stripe | null;
	products: CartItem[];
	coupons: Coupon[];
	stripeIntent: Intent | null;

	addressForm: FormGroup;
	billingForm: FormGroup;

	countries: CountryPair[];
	filteredCountries: Observable<CountryPair[]>;
	filteredCountries2: Observable<CountryPair[]>;

	cantEdit: boolean;

	currencyFormatter = new Intl.NumberFormat(undefined, {
		style: 'currency',
		currency: 'USD'
	})

	readonly separatorKeysCodes = [ENTER, COMMA] as const;

	private orderID: string;

	constructor(private scriptLoader: DynamicScriptLoaderService, private http: HttpClient, private cartService: CartService, private router: Router) {
		this.stripe = null;
		this.products = [];
		this.coupons = [];
		this.stripeIntent = null;

		this.cantEdit = false;

		this.orderID = '';

		this.addressForm = new FormGroup({
			fullName: new FormControl('', [Validators.required]),
			country: new FormControl('', [Validators.required]),
			street1: new FormControl('', [Validators.required]),
			street2: new FormControl(''),
			stateProvidenceRegion: new FormControl('', [Validators.required]),
			city: new FormControl('', [Validators.required]),
			zip: new FormControl('', [Validators.required]),
			phoneNumber: new FormControl('', [Validators.required])
		});

		this.billingForm = new FormGroup({
			email: new FormControl('', [Validators.required, Validators.email]),
			fullName: new FormControl('', [Validators.required]),
			country: new FormControl('', [Validators.required]),
			street1: new FormControl('', [Validators.required]),
			street2: new FormControl(''),
			stateProvidenceRegion: new FormControl('', [Validators.required]),
			city: new FormControl('', [Validators.required]),
			zip: new FormControl('', [Validators.required]),
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
	}

	ngOnInit(): void {
		this.http.get<CountryPair[]>(window.location.origin + '/assets/country/countries.json').toPromise().then(res => {
			this.countries = res;
		});

		this.cartService.getCart().toPromise().then(cart => {
			this.products = cart;
		});

		this.scriptLoader.load('stripe').then(data => {
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
		});
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
					this.router.navigate(['/checkout/placed'], { queryParams: { id: paymentRes }});
				});
			}
		});
	}

	private submitPaymentMethod(paymentMethodID: any): Observable<any> {
		const accessToken = localStorage.getItem('accessToken');
		let headers = new HttpHeaders();	
		if (accessToken) {
			headers = headers.append('Authorization', 'Bearer ' + accessToken);
		}
		const email = this.billingForm.get('email')!.value;
		const addresses = this.getAddressDetails();
		console.log({ paymentMethodID, email, addresses, products: this.products, coupons: this.coupons });
		return this.http.post<string>(environment.apiServer + 'payment/checkoutPayment', { paymentMethodID, email, addresses, products: this.products, coupons: this.coupons }, { headers });
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
		let total = 0;
		// TODO
		return total;
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

	private _filter(value: string): CountryPair[] {
		const filterValue = value.toLowerCase();
		return this.countries.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0);
	}

}
