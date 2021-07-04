import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckoutRedirectComponent } from './checkout-redirect/checkout-redirect.component';
import { CheckoutComponent } from './checkout/checkout.component';

const routes: Routes = [
	{
		path: '',
		component: CheckoutComponent
	},
	{
		path: 'placed',
		component: CheckoutRedirectComponent
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CheckoutRoutingModule { }
