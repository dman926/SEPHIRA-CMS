import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebsocketService } from '../services/websocket.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, OnDestroy {

	private subs: Subscription[];

	constructor(private wsService: WebsocketService) {
		this.subs = [];
	}

	ngOnInit(): void {
		this.subs.push(this.wsService.listen('connection').subscribe(data => {
			console.log(data);
		}));
	}

	ngOnDestroy(): void {
		this.subs.forEach(sub => sub.unsubscribe());
	}

}
