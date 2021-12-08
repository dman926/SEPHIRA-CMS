import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShippingZonesComponent } from './pages/shipping-zones/shipping-zones.component';

const routes: Routes = [
	{
		path: '',
		component: ShippingZonesComponent
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShippingZonesRoutingModule { }
