import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CouponsRoutingModule } from './coupons-routing.module';
import { CouponsComponent } from './coupons/coupons.component';
import { CouponComponent } from './coupon/coupon.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@NgModule({
  declarations: [
    CouponsComponent,
    CouponComponent
  ],
  imports: [
    CommonModule,
    CouponsRoutingModule,

	MatPaginatorModule,
	MatButtonModule,
	MatProgressSpinnerModule
  ]
})
export class CouponsModule { }
