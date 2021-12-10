import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShippingZoneComponent } from './pages/shipping-zone/shipping-zone.component';
import { ShippingZonesComponent } from './pages/shipping-zones/shipping-zones.component';

const routes: Routes = [
	{
		path: '',
		component: ShippingZonesComponent
	},
	{
		path: 'id',
		component: ShippingZoneComponent
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShippingZonesRoutingModule { }
