import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';

@Component({
	selector: 'app-landing',
	templateUrl: './landing.component.html',
	styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

	constructor(private wsService: WebsocketService) { }

	ngOnInit(): void {
		this.wsService.listen('connection').subscribe(data => {
			console.log(data);
		});
	}

}
