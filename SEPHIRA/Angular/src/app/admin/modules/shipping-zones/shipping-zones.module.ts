import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShippingZonesRoutingModule } from './shipping-zones-routing.module';
import { ShippingZonesComponent } from './pages/shipping-zones/shipping-zones.component';
import { ShippingZoneComponent } from './pages/shipping-zone/shipping-zone.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { LoaderSpinnerModule } from 'src/app/features/loader-spinner/loader-spinner.module';
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
		MatFormFieldModule,
		MatInputModule,
		MatCheckboxModule,
		MatIconModule,
		MatSelectModule,

		LoaderSpinnerModule
	]
})
export class ShippingZonesModule { }
