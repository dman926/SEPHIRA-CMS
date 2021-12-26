import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CoreService } from 'src/app/core/services/core/core.service';
import { DynamicScriptLoaderService } from 'src/app/core/services/dynamic-script-loader/dynamic-script-loader.service';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { CartItem } from 'src/app/models/cart-item';
import { AddressForm } from 'src/app/models/order';
import { Coupon } from 'src/app/models/posts/coupon';
import { ShippingZone } from 'src/app/models/shipping-zone';
import { TaxRate } from 'src/app/models/tax-rate';
import { CheckoutService } from '../../../services/checkout/checkout.service';

declare var paypal: any;

@Component({
	selector: 'sephira-paypal',
	templateUrl: './paypal.component.html',
	styleUrls: ['./paypal.component.scss'],
})
export class PaypalComponent implements OnInit {

	@Input() cartItems: CartItem[];
	@Output() paymentSuccess: EventEmitter<string>;

	@ViewChild('paypalButtonContainer', { static: true }) private paypalButtonContainer: ElementRef<HTMLDivElement> | undefined;

	paypalReady: boolean;
	orderID: string | null;
	coupons: Coupon[];
	taxRate: TaxRate | undefined;
	shippingZone: ShippingZone | undefined;

	addressForm: FormGroup;
	billingForm: FormGroup;

	constructor(private checkout: CheckoutService, private core: CoreService, private platform: PlatformService, private scriptLoader: DynamicScriptLoaderService) {
		this.cartItems = [];
		this.paymentSuccess = new EventEmitter<string>();

		this.paypalReady = false;
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
	}

	ngOnInit(): void {
		if (this.platform.isBrowser && this.paypalButtonContainer) {
			this.scriptLoader.load('paypal').then(data => {
				this.paypalReady = data[0].loaded;
				if (!this.paypalReady) {
					throw new Error('`paypal` failed to load');
				}
			});
			this.checkout.createOrder(this.cartItems, 'paypal').subscribe(orderID => {
				this.orderID = orderID;
			})
		}
	}

	renderPayPal(): void {
		const orderID = this.orderID;
		if (!orderID) {
			return;
		}
		const returnLoc = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port;
		if (this.paypalButtonContainer) {
			this.paypalButtonContainer.nativeElement.innerHTML = '';
		}
		this.checkout.editOrder(orderID, this.cartItems, this.getAddressDetails(), this.coupons).subscribe(res => {
			paypal.Buttons({
				createOrder: async (data: any, actions: any) => {
					return this.checkout.paypalCheckout(orderID, returnLoc).subscribe();
				},
				onApprove: async (data: any, actions: any) => {
					this.checkout.paypalCapture(orderID).subscribe(res => {
						this.paymentSuccess.emit(orderID);
					});
				}
			}).render('#paypal-button-container');
		});
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
