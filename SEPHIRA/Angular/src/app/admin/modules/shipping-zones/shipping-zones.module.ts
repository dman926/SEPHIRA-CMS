import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShippingZonesRoutingModule } from './shipping-zones-routing.module';
import { ShippingZonesComponent } from './pages/shipping-zones/shipping-zones.component';


@NgModule({
  declarations: [
    ShippingZonesComponent
  ],
  imports: [
    CommonModule,
    ShippingZonesRoutingModule
  ]
})
export class ShippingZonesModule { }
