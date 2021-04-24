import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CheckoutRoutingModule } from './checkout-routing.module';
import { CheckoutComponent } from './checkout/checkout.component';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
	declarations: [
		CheckoutComponent
	],
	imports: [
		CommonModule,
		CheckoutRoutingModule,

		HttpClientModule
	]
})
export class CheckoutModule { }
