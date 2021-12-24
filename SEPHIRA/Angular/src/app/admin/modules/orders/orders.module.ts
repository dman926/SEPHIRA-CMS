import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrdersRoutingModule } from './orders-routing.module';
import { OrdersComponent } from './pages/orders/orders.component';
import { OrderComponent } from './pages/order/order.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { LoaderSpinnerModule } from 'src/app/features/loader-spinner/loader-spinner.module';


@NgModule({
	declarations: [
		OrdersComponent,
		OrderComponent
	],
	imports: [
		CommonModule,
		OrdersRoutingModule,

		MatPaginatorModule,
		MatButtonModule,
		
		LoaderSpinnerModule
	]
})
export class OrdersModule { }
