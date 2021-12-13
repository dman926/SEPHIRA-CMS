import { Component, OnInit } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { WebsocketService } from 'src/app/core/services/websocket/websocket.service';
import { Order } from 'src/app/models/order';
import { CheckoutService } from '../../services/checkout/checkout.service';

@Component({
	selector: 'sephira-checkout-confirm',
	templateUrl: './checkout-confirm.component.html',
	styleUrls: ['./checkout-confirm.component.scss'],
})
export class CheckoutConfirmComponent implements OnInit {

	order: Order | null;
	loaded: boolean;

	constructor(private checkout: CheckoutService, private ws: WebsocketService, private route: ActivatedRoute, private platform: PlatformService, private state: TransferState) {
		this.order = null;
		this.loaded = false;
	}

	ngOnInit(): void {
		this.route.queryParams.subscribe(params => {
			const id: string = params['id']
			if (id) {
				const stateKey = makeStateKey<Order>('Order');
				if (this.platform.isServer) {
					this.checkout.getOrder(id).subscribe(res => {
						this.order = res;
						this.loaded = true;
						this.state.set(stateKey, res);
					})
				} else {
					this.order = this.state.get(stateKey, null);
					if (!this.order || this.order.id !== id) {
						this.checkout.getOrder(id).subscribe(res => {
							this.order = res;
							this.loaded = true;
						})
					}
				}
			} else {
				this.order = null;
				this.loaded = true;
			}
		});
	}

}
