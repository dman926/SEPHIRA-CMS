import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AdminService } from 'src/app/admin/servies/admin.service';
import { Order } from 'src/app/models/order';

@Component({
	selector: 'sephira-orders',
	templateUrl: './orders.component.html',
	styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit {
	
	loaded: boolean;
	orders: Order[];

	orderPageEvent: PageEvent;

	constructor(private admin: AdminService) {
		this.loaded = false;
		this.orders = [];
		this.orderPageEvent = {
			length: 0,
			pageIndex: 0,
			pageSize: 10,
			previousPageIndex: 0
		};
	}

	ngOnInit(): void {
		this.fetchOrders();
	}

	get shownOrders(): Order[] {
		const index = this.orderPageEvent.pageIndex;
		const size = this.orderPageEvent.pageSize;
		return this.orders.slice(index * size, index * size + size);
	}

	fetchOrders(event?: PageEvent): void {
		if (event) {
			this.orderPageEvent = event;
			if (event.pageIndex * event.pageSize < this.orders.length) {
				return;
			}
		}
		this.loaded = false;
		this.admin.getAllOrders(this.orderPageEvent.pageIndex, this.orderPageEvent.pageSize).subscribe({
			next: orders => {
				this.orderPageEvent.length = orders.count;
				this.orders = this.orders.concat(orders.orders);
				this.loaded = true;
			},
			error: err => this.loaded = true
		});
	}

}
