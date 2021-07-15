import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CouponComponent } from './coupon/coupon.component';
import { CouponsComponent } from './coupons/coupons.component';

const routes: Routes = [
	{
		path: '',
		component: CouponsComponent
	},
	{
		path: ':id',
		component: CouponComponent
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CouponsRoutingModule { }
