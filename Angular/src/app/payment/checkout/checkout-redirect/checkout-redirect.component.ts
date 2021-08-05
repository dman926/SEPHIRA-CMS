import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie';
import { Subscription } from 'rxjs';
import { PlatformService } from 'src/app/core/services/platform.service';
import { WebsocketService } from 'src/app/core/services/websocket.service';
import { Order } from 'src/app/models/order';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-checkout-redirect',
	templateUrl: './checkout-redirect.component.html',
	styleUrls: ['./checkout-redirect.component.scss']
})
export class CheckoutRedirectComponent implements OnInit, OnDestroy {

	order: Order | null;

	private orderID: string | null;
	private subs: Subscription[];

	constructor(private route: ActivatedRoute, private http: HttpClient, private ws: WebsocketService, private platformService: PlatformService, private cookie: CookieService) {
		this.orderID = null;
		this.order = null;
		this.subs = [];
	}

	ngOnInit(): void {
		this.orderID = this.route.snapshot.queryParamMap.get('id');
		if (this.platformService.isBrowser()) {
			this.getData();
			this.subs.push(this.ws.listen('order ' + this.orderID).subscribe(res => {
				if (this.order) {
					this.order.orderStatus = res as string;
				}
			}));
		}
	}

	ngOnDestroy(): void {
		this.subs.forEach(sub => sub.unsubscribe());
	}

	getData(): void {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken).append('Accept', 'application/json');
			this.http.get<Order>(environment.apiServer + 'order/order/' + this.orderID, { headers }).toPromise().then(res => {
				this.order = res;
			});
		} else {
			this.http.get<Order>(environment.apiServer + 'order/order/' + this.orderID).toPromise().then(res => {
				this.order = res;
			});
		}
	}

}
