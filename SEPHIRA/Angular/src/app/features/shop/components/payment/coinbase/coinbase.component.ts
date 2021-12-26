import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { CoreService } from 'src/app/core/services/core/core.service';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { CartItem } from 'src/app/models/cart-item';
import { AddressForm } from 'src/app/models/order';
import { Coupon } from 'src/app/models/posts/coupon';
import { ShippingZone } from 'src/app/models/shipping-zone';
import { TaxRate } from 'src/app/models/tax-rate';
import { CheckoutService, CoinbaseRes } from '../../../services/checkout/checkout.service';

@Component({
	selector: 'sephira-coinbase',
	templateUrl: './coinbase.component.html',
	styleUrls: ['./coinbase.component.scss'],
})
export class CoinbaseComponent implements OnInit {

	@Input() cartItems: CartItem[];
	@Output() paymentSuccess: EventEmitter<string>;

	orderID: string | null;
	coupons: Coupon[];
	taxRate: TaxRate | undefined;
	shippingZone: ShippingZone | undefined;

	addressForm: FormGroup;

	coinbaseRes: CoinbaseRes | null;

	constructor(private checkout: CheckoutService, private core: CoreService, private platform: PlatformService) {
		this.cartItems = [];
		this.paymentSuccess = new EventEmitter<string>();
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

		this.coinbaseRes = null;
	}

	ngOnInit(): void {
		if (this.platform.isBrowser) {
			this.checkout.createOrder(this.cartItems, 'coinbase').subscribe(orderID => {
				this.orderID = orderID;
			});
		}
	}

	renderCoinbase(): void {
		const orderID = this.orderID;
		if (!orderID) {
			return;
		}
		const returnLoc = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/shop/checkout/placed?id=' + orderID;
		this.checkout.editOrder(orderID, this.cartItems, this.getAddressDetails(), this.coupons).subscribe(res => {
			this.checkout.getCoinbaseCommerceRes(orderID, returnLoc).pipe(map(res => {
				res.expires_at = new Date(res.expires_at);
				return res;
			})).subscribe(res => {
				this.coinbaseRes = res;
			});
		})
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
			}
		};
		return addresses;
	}

	get now(): Date {
		return new Date();
	}

}
