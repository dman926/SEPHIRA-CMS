import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckoutConfirmComponent } from './pages/checkout-confirm/checkout-confirm.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { ShopComponent } from './pages/shop/shop.component';

const routes: Routes = [
	{
		path: '',
		component: ShopComponent
	},
	{
		path: 'checkout',
		component: CheckoutComponent
	},
	{
		path: 'checkout/placed',
		component: CheckoutConfirmComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ShopRoutingModule { }
