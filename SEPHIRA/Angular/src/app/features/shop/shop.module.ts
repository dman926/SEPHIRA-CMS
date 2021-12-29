import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ShopRoutingModule } from './shop-routing.module';
import { ShopComponent } from './pages/shop/shop.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutConfirmComponent } from './pages/checkout-confirm/checkout-confirm.component';
import { ProductDisplayComponent } from './components/product-display/product-display.component';
import { StripeComponent } from './components/payment/stripe/stripe.component';
import { PaypalComponent } from './components/payment/paypal/paypal.component';
import { CoinbaseComponent } from './components/payment/coinbase/coinbase.component';
import { NowpaymentsComponent } from './components/payment/nowpayments/nowpayments.component';
import { CouponInputComponent } from './components/coupon-input/coupon-input.component';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';

import { LoaderSpinnerModule } from '../loader-spinner/loader-spinner.module';
import { StarRatingModule } from '../star-rating/star-rating.module';
import { PriceTotalDisplayComponent } from './components/price-total-display/price-total-display.component';
import { CheckoutAddressFormComponent } from './components/checkout-address-form/checkout-address-form.component';
import { MatSelectModule } from '@angular/material/select';
import { QrCodeModule } from 'ng-qrcode';

@NgModule({
	declarations: [
		ShopComponent,
		CheckoutComponent,
		CartComponent,
		CheckoutConfirmComponent,
		ProductDisplayComponent,
		StripeComponent,
		PaypalComponent,
		CoinbaseComponent,
		NowpaymentsComponent,
		CouponInputComponent,
		PriceTotalDisplayComponent,
		CheckoutAddressFormComponent
	],
	imports: [
		CommonModule,
		ShopRoutingModule,
		ReactiveFormsModule,

		MatButtonModule,
		MatIconModule,
		MatBadgeModule,
		MatMenuModule,
		MatPaginatorModule,
		MatCardModule,
		MatTabsModule,
		MatFormFieldModule,
		MatInputModule,
		MatListModule,
		MatGridListModule,
		MatChipsModule,
		MatStepperModule,
		MatSelectModule,

		LoaderSpinnerModule,
		StarRatingModule,

		QrCodeModule
	],
	exports: [
		CartComponent
	]
})
export class ShopModule { }
