import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShippingZonesRoutingModule } from './shipping-zones-routing.module';
import { ShippingZonesComponent } from './shipping-zones/shipping-zones.component';
import { ShippingZoneComponent } from './shipping-zone/shipping-zone.component';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';


@NgModule({
	declarations: [
		ShippingZonesComponent,
		ShippingZoneComponent
	],
	imports: [
		CommonModule,
		ShippingZonesRoutingModule,
		ReactiveFormsModule,

		MatPaginatorModule,
		MatButtonModule,
		MatProgressSpinnerModule,
		MatFormFieldModule,
		MatInputModule,
		MatCheckboxModule,
		MatIconModule,
		MatSelectModule
	]
})
export class ShippingZonesModule { }
