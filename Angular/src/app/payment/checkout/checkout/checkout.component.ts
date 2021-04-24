import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CartService } from '../../cart/cart.service';

interface Intent {
	clientSecret?: string;
	hosted_url?: string;
}

@Component({
	selector: 'app-checkout',
	templateUrl: './checkout.component.html',
	styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

	stripe: stripe.Stripe;
	products: any[]
	stripeIntent: Intent | null;
	coinbaseIntent: Intent | null;
	noItems: boolean;

	constructor(private http: HttpClient, private cartService: CartService) {
		// Change this on your end
		this.stripe = Stripe(environment.stripeKey);
		this.products = [{ 'sku': 'test', 'quantity': 1 }];
		this.stripeIntent = null;
		this.coinbaseIntent = null;
		this.noItems = false;
	}

	ngOnInit(): void {
		const headers = new HttpHeaders().append('Content-Type', 'application/json');
		
		this.cartService.getCart().toPromise().then(cart => {
			if (cart.length > 0) {
				this.http.post<Intent>(environment.apiServer + 'payment/stripePaymentIntent', JSON.stringify(cart), { headers })
				.toPromise().then(intent => {
					if (intent) {
						this.stripeIntent = intent;
					} else {
						this.stripeIntent = null;
					}
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
					card.mount('#card-element');
				
					card.on('change', function(event) {
						// Disable the Pay button if there are no card details in the Element
						const button = document.querySelector('button');
						const cardError = document.querySelector('#card-error');
						if (event && event.error && button && cardError) {
							button.disabled = event.empty;
							cardError.textContent = event.error ? event.error.message ? event.error.message : null : '';
						}
					});
					const form = document.getElementById('payment-form');
					if (form) {
						form.addEventListener('submit', event => {
							event.preventDefault();
							// Complete payment when the submit button is clicked
							this.payWithCard(this.stripe, card, this.stripeIntent?.clientSecret);
						});
					}
				});

				this.http.post<Intent>(environment.apiServer + 'payment/coinbasePaymentIntent', JSON.stringify(cart), { headers })
				.toPromise().then(intent => {
					console.log(intent);
					if (intent) {
						this.coinbaseIntent = intent;
					} else {
						this.coinbaseIntent = null;
					}
				});
			} else {
				this.noItems = true;
			}
		});
	}

	payWithCard(stripe: stripe.Stripe, card: stripe.elements.Element, clientSecret: string | undefined) {
		if (clientSecret) {
			// loading
			this.stripe.confirmCardPayment(clientSecret, {
				payment_method: {
					card: card
				}
			}).then(function (result: any) {
				if (result.error) {
					// Show error to your customer
					console.log('fail');
				} else {
					// The payment succeeded!
					console.log('success');
				}
			})
		}
	}

}
