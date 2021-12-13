import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { CoreService } from 'src/app/core/services/core/core.service';
import { CartItem } from 'src/app/models/cart-item';
import { AddressForm, Order } from 'src/app/models/order';
import { Coupon } from 'src/app/models/posts/coupon';
import { ShippingRate } from 'src/app/models/shipping-zone';
import { TaxRate } from 'src/app/models/tax-rate';
import { environment } from 'src/environments/environment';

export interface CoinbaseRes {
	expires_at: string | Date;
	hosted_url: string;
}

@Injectable({
	providedIn: 'root',
})
export class CheckoutService {

	private readonly orderBase = environment.apiServer + 'order/';
	private readonly paymentBase = environment.apiServer + 'payment/';
	private readonly shippingBase = environment.apiServer + 'shipping/';
	private readonly taxBase = environment.apiServer + 'tax/';
	private readonly requiredLoggedIn = environment.requireLoggedInToCheckout;

	constructor(private http: HttpClient, private core: CoreService) { }

	public createOrder(products: CartItem[]): Observable<string> {
		let headers = this.core.createAuthHeader();
		if (!headers) {
			if (this.requiredLoggedIn) {
				return EMPTY;
			}
			headers = new HttpHeaders();
		}
		return this.http.post<string>(this.orderBase + 'orders', { products }, { headers });
	}

	public editOrder(id: string, items?: CartItem[], addresses?: AddressForm, coupons?: Coupon[]): Observable<string> {
		let headers = this.core.createAuthHeader();
		if (!headers) {
			if (this.requiredLoggedIn) {
				return EMPTY;
			}
			headers = new HttpHeaders();
		}
		let payload: any = {};
		if (items) {
			payload['items'] = items;
		}
		if (addresses) {
			payload['addresses'] = addresses;
		}
		if (coupons) {
			payload['coupons'] = coupons;
		}
		return this.http.put<string>(this.orderBase + 'order/' + id, payload, { headers });
	}

	public getOrder(id: string): Observable<Order> {
		let headers = this.core.createAuthHeader();
		if (!headers) {
			if (this.requiredLoggedIn) {
				return EMPTY;
			}
			headers = new HttpHeaders();
		}
		return this.http.get<Order>(this.orderBase + 'order/' + id, { headers });
	}

	public getShippingRate(country: string, state: string): Observable<ShippingRate[]> {
		if (this.requiredLoggedIn) {
			return EMPTY;
		}
		const params = new HttpParams().append('state', state);
		return this.http.get<ShippingRate[]>(this.shippingBase + country, { params });
	}

	public getTaxRate(country: string, zip: string): Observable<TaxRate> {
		if (this.requiredLoggedIn) {
			return EMPTY;
		}
		const params = new HttpParams().append('zip', zip);
		return this.http.get<TaxRate>(this.taxBase + country, { params });
	}

	public stripeCheckout(paymentMethodID: string, email: string, addresses: AddressForm, orderID: string): Observable<string> {
		let headers = this.core.createAuthHeader();
		if (!headers) {
			if (this.requiredLoggedIn) {
				return EMPTY;
			}
			headers = new HttpHeaders();
		}
		return this.http.post<string>(this.paymentBase + 'stripe/checkout', { paymentMethodID, email, addresses, orderID }, { headers });
	}

	public paypalCheckout(orderID: string, location: string): Observable<any> {
		let headers = this.core.createAuthHeader();
		if (!headers) {
			if (this.requiredLoggedIn) {
				return EMPTY;
			}
			headers = new HttpHeaders();
		}
		return this.http.post<any>(this.paymentBase + 'paypal/checkout', { orderID, location }, { headers });
	}

	public paypalCapture(orderID: string): Observable<any> {
		let headers = this.core.createAuthHeader();
		if (!headers) {
			if (this.requiredLoggedIn) {
				return EMPTY;
			}
			headers = new HttpHeaders();
		}
		return this.http.post<any>(this.paymentBase + 'paypal/capture', { orderID }, { headers });
	}

	public getCoinbaseCommerceRes(orderID: string, location: string): Observable<CoinbaseRes> {
		let headers = this.core.createAuthHeader();
		if (!headers) {
			if (this.requiredLoggedIn) {
				return EMPTY;
			}
			headers = new HttpHeaders();
		}
		return this.http.post<CoinbaseRes>(this.paymentBase + 'coinbase/checkout', { orderID, location }, { headers })
	}

}