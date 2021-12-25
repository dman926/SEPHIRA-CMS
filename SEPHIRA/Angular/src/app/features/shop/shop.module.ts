import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ShopRoutingModule } from './shop-routing.module';
import { ShopComponent } from './pages/shop/shop.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutConfirmComponent } from './pages/checkout-confirm/checkout-confirm.component';
import { ProductDisplayComponent } from './components/product-display/product-display.component';

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

import { LoaderSpinnerModule } from '../loader-spinner/loader-spinner.module';
import { StarRatingModule } from '../star-rating/star-rating.module';
import { StripeComponent } from './components/payment/stripe/stripe.component';
import { PaypalComponent } from './components/payment/paypal/paypal.component';
import { CoinbaseComponent } from './components/payment/coinbase/coinbase.component';
import { NowpaymentsComponent } from './components/payment/nowpayments/nowpayments.component';

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
  NowpaymentsComponent
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

		LoaderSpinnerModule,
		StarRatingModule
	],
	exports: [
		CartComponent
	]
})
export class ShopModule { }
