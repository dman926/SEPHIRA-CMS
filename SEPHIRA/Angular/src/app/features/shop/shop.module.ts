import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShopRoutingModule } from './shop-routing.module';
import { ShopComponent } from './pages/shop/shop.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutConfirmComponent } from './pages/checkout-confirm/checkout-confirm.component';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { ProductDisplayComponent } from './components/product-display/product-display.component';
import { LoaderSpinnerModule } from '../loader-spinner/loader-spinner.module';
import { MatPaginatorModule } from '@angular/material/paginator';


@NgModule({
	declarations: [
		ShopComponent,
		CheckoutComponent,
		CartComponent,
		CheckoutConfirmComponent,
  ProductDisplayComponent
	],
	imports: [
		CommonModule,
		ShopRoutingModule,

		MatButtonModule,
		MatIconModule,
		MatBadgeModule,
		MatMenuModule,
		MatPaginatorModule,

		LoaderSpinnerModule
	],
	exports: [
		CartComponent
	]
})
export class ShopModule { }
