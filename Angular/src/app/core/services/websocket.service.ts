import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

import { environment } from 'src/environments/environment';
import { PlatformService } from './platform.service';

@Injectable({
	providedIn: 'root'
})
export class WebsocketService {

	socket: WebSocketSubject<any> | null;

	constructor(private platformService: PlatformService, private cookie: CookieService) {
		this.socket = null;
		if (this.platformService.isBrowser()) {
			this.socket = webSocket(environment.socketServer);
		}
	}

	setSocket(socket: WebSocketSubject<any> | null) {
		this.socket = socket;
	}

	killSocket() {
		if (this.socket) {
			this.socket.complete();
			this.socket = null;
		}
	}

	emit(data: any): boolean {
		this.socket?.next(data);
		return !!this.socket;
	}
}
