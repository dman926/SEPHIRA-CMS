import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrdersRoutingModule } from './orders-routing.module';
import { OrdersComponent } from './orders/orders.component';
import { OrderComponent } from './order/order.component';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


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
	MatProgressSpinnerModule
  ]
})
export class OrdersModule { }
