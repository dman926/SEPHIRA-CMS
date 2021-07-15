import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CheckoutRoutingModule } from './checkout-routing.module';
import { CheckoutComponent } from './checkout/checkout.component';
import { HttpClientModule } from '@angular/common/http';

import { MatStepperModule } from '@angular/material/stepper';
import { ReactiveFormsModule } from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { CheckoutRedirectComponent } from './checkout-redirect/checkout-redirect.component';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
	declarations: [
		CheckoutComponent,
  CheckoutRedirectComponent
	],
	imports: [
		CommonModule,
		CheckoutRoutingModule,

		HttpClientModule,
		ReactiveFormsModule,

		MatStepperModule,

		MatFormFieldModule,
		MatInputModule,
		MatAutocompleteModule,
		MatButtonModule,
		MatListModule,
		MatChipsModule,
		MatIconModule,
		MatProgressSpinnerModule
	]
})
export class CheckoutModule { }
