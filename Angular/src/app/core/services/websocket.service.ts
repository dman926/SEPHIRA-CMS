import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io-client/build/typed-events';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root'
})
export class WebsocketService {

	socket: Socket<DefaultEventsMap, DefaultEventsMap>;

	constructor() {
		this.socket = io(environment.socketServer);
	}

	listen(eventName: string) {
		return new Observable(subscriber => {
			this.socket.on(eventName, (data: any) => {
				subscriber.next(data);
			})
		});
	}

	emit(eventName: string, data: any) {
		this.socket.emit(eventName, data);
	}
}
