import { Component, OnInit } from '@angular/core';
import { Order } from 'src/app/models/order';
import { AdminService } from '../../admin.service';

interface PageEvent {
	length: number;
	pageIndex: number;
	pageSize: number;
	previousPageIndex?: number;
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {

	loaded: boolean;
	orders: Order[];

	orderPageEvent: PageEvent;
	orderCount: number;

	constructor(private admin: AdminService) {
		this.loaded = false;
		this.orders = [];
		this.orderPageEvent = {
			length: 0,
			pageIndex: 0,
			pageSize: 10,
			previousPageIndex: 0
		};
		this.orderCount = 0;
	}

	ngOnInit(): void {
		this.admin.getOrderCount().toPromise().then(count => {
			this.orderCount = count;
		});
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
		}
		this.loaded = false;
		this.admin.getAllOrders(this.orderPageEvent.pageIndex, this.orderPageEvent.pageSize).toPromise().then(orders => {
			this.orders = this.orders.concat(orders);
			this.loaded = true;
		}).catch(err => this.loaded = true);
	}

}
