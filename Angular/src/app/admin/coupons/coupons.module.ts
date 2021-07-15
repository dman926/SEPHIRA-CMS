import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CouponsRoutingModule } from './coupons-routing.module';
import { CouponsComponent } from './coupons/coupons.component';
import { CouponComponent } from './coupon/coupon.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AngularEditorModule } from '@kolkov/angular-editor';


@NgModule({
	declarations: [
		CouponsComponent,
		CouponComponent
	],
	imports: [
		CommonModule,
		CouponsRoutingModule,
		ReactiveFormsModule,

		MatPaginatorModule,
		MatButtonModule,
		MatProgressSpinnerModule,
		MatSelectModule,
		MatIconModule,
		MatFormFieldModule,
		MatInputModule,
		MatCheckboxModule,

		AngularEditorModule
	]
})
export class CouponsModule { }
