import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, map } from 'rxjs';
import { CoreService } from 'src/app/core/services/core/core.service';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { CartItem } from 'src/app/models/cart-item';
import { AddressForm } from 'src/app/models/order';
import { Coupon } from 'src/app/models/posts/coupon';
import { ShippingZone } from 'src/app/models/shipping-zone';
import { TaxRate } from 'src/app/models/tax-rate';
import { environment } from 'src/environments/environment';
import { CheckoutService, NowPaymentCoin, NowPaymentRes, NowPaymentsMinAmountRes } from '../../../services/checkout/checkout.service';

@Component({
	selector: 'sephira-nowpayments',
	templateUrl: './nowpayments.component.html',
	styleUrls: ['./nowpayments.component.scss']
})
export class NowpaymentsComponent {

	@Input() cartItems: CartItem[];

	orderID: string | null;
	coupons: Coupon[];
	taxRate: TaxRate | undefined;
	shippingZone: ShippingZone | undefined;

	coinForm: FormGroup;
	addressForm: FormGroup;

	availableCoins: NowPaymentCoin[];
	minimalAmount: NowPaymentsMinAmountRes | undefined;
	coinSelected: boolean;

	nowPaymentRes: NowPaymentRes | null;

	readonly checkoutStyle = environment.nowPaymentsCheckoutStyle;

	constructor(private checkout: CheckoutService, private core: CoreService, private platform: PlatformService) {
		this.cartItems = [];
		this.orderID = null;
		this.coupons = [];

		this.coinForm = new FormGroup({
			coin: new FormControl('', [Validators.required])
		});
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

		this.availableCoins = [];
		this.coinSelected = false;

		this.nowPaymentRes = null;
	}

	ngOnInit(): void {
		if (this.platform.isBrowser) {
			this.checkout.createOrder(this.cartItems, 'nowpayments').subscribe(orderID => {
				this.orderID = orderID;
			});
			if (this.checkoutStyle !== 'invoice') {
				this.checkout.getNowPaymentsCoins().subscribe(coins => {
					this.availableCoins = coins;
				});
			}
			
			this.coin.valueChanges.subscribe(coin => {
				this.coinSelected = !!coin;
				this.minimalAmount = undefined;
				if (this.coinSelected) {
					this.checkout.getNowPaymentsMinAmount(coin['coin']).subscribe(amount => {
						this.minimalAmount = amount;
					});
				}
			});
			this.addressForm.get('stateProvidenceRegion')!.valueChanges.pipe(debounceTime(1500)).subscribe(state => {
				if (this.addressForm.get('stateProvidenceRegion')!.valid) {
					const country = this.addressForm.get('country')!.value;
					if (country) {
						this.checkout.getShippingZone(country, state).subscribe(shippingZone => {
							this.shippingZone = shippingZone;
						});
					}
				}
			});
			this.addressForm.get('zip')!.valueChanges.pipe(debounceTime(1500)).subscribe(zip => {
				if (this.addressForm.get('zip')!.valid) {
					const country = this.addressForm.get('country')!.value;
					if (country) {
						this.checkout.getTaxRate(country, zip).subscribe(taxRate => {
							this.taxRate = taxRate;
						});
					}
				}
			});
		}
	}

	renderNowPayments(): void {
		const orderID = this.orderID;
		if (!orderID || !this.coin.value) {
			return;
		}
		const returnLoc = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port;
		this.checkout.editOrder(orderID, this.cartItems, this.getAddressDetails(), this.coupons).subscribe(res => {
			if (this.checkoutStyle !== 'invoice') {
				this.checkout.nowPaymentsPaymentCheckout(orderID, this.coin.value['coin']).pipe(map(res => {
					res.created_at = new Date(res.created_at);
					return res;
				})).subscribe(res => {
					this.nowPaymentRes = res;
				});
			} else {
				this.checkout.nowPaymentsInvoiceCheckout(orderID, this.coin.value['coin'], returnLoc).pipe(map(res => {
					res.created_at = new Date(res.created_at);
					return res;
				})).subscribe(res => {
					this.nowPaymentRes = res;
				});
			}
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

	get coin(): FormControl {
		return this.coinForm.get('coin')! as FormControl;
	}

}
