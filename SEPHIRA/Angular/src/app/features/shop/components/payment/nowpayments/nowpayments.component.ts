import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CoreService } from 'src/app/core/services/core/core.service';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { CartItem } from 'src/app/models/cart-item';
import { Coupon } from 'src/app/models/posts/coupon';
import { ShippingZone } from 'src/app/models/shipping-zone';
import { TaxRate } from 'src/app/models/tax-rate';
import { environment } from 'src/environments/environment';
import { CheckoutService } from '../../../services/checkout/checkout.service';

@Component({
	selector: 'sephira-nowpayments',
	templateUrl: './nowpayments.component.html',
	styleUrls: ['./nowpayments.component.scss'],
})
export class NowpaymentsComponent {

	@Input() cartItems: CartItem[];

	orderID: string | null;
	coupons: Coupon[];
	taxRate: TaxRate | undefined;
	shippingZone: ShippingZone | undefined;

	coinForm: FormGroup;
	addressForm: FormGroup;

	availableCoins: string[];

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
		}
	}

}
