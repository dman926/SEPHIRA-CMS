import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShippingZonesRoutingModule } from './shipping-zones-routing.module';
import { ShippingZonesComponent } from './pages/shipping-zones/shipping-zones.component';
import { ShippingZoneComponent } from './pages/shipping-zone/shipping-zone.component';


@NgModule({
  declarations: [
    ShippingZonesComponent,
    ShippingZoneComponent
  ],
  imports: [
    CommonModule,
    ShippingZonesRoutingModule
  ]
})
export class ShippingZonesModule { }
