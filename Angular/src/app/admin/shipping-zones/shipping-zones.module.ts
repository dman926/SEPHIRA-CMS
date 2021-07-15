import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShippingZonesRoutingModule } from './shipping-zones-routing.module';
import { ShippingZonesComponent } from './shipping-zones/shipping-zones.component';
import { ShippingZoneComponent } from './shipping-zone/shipping-zone.component';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule } from '@angular/forms';


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
		MatProgressSpinnerModule
	]
})
export class ShippingZonesModule { }
