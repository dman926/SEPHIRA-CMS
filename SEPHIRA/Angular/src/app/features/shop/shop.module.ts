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


@NgModule({
	declarations: [
		ShopComponent,
		CheckoutComponent,
		CartComponent,
		CheckoutConfirmComponent
	],
	imports: [
		CommonModule,
		ShopRoutingModule,

		MatButtonModule,
		MatIconModule,
		MatBadgeModule,
		MatMenuModule
	],
	exports: [
		CartComponent
	]
})
export class ShopModule { }
