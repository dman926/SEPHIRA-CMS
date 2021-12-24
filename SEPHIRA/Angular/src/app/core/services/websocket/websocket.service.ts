import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';
import { CookieService } from '../cookie/cookie.service';

interface SocketEl {
	namespace: string;
	url: string;
	socket: WebSocketSubject<any>;
}

export interface Payload {
	type: string;
	payload: any;
}

@Injectable({
	providedIn: 'root',
})
export class WebsocketService {

	// Should be fine to use an array instead of a map because it's realistic to not expect a massive number of open sockets (<100).
	private sockets: SocketEl[];
	private baseWSServer: string | undefined;

	constructor(private cookie: CookieService) {
		this.sockets = [];
		const wsServer = environment.apiServer;
		if (wsServer.substring(0, 5) === 'https') {
			this.baseWSServer = 'wss' + wsServer.substring(5);
		} else if (wsServer.substring(0, 4) === 'http') {
			this.baseWSServer = 'ws' + wsServer.substring(4);
		} else {
			throw new Error('`apiServer` environment variable incorrectly defined. Should begin with `https` or `http`');
		}
	}

	/**
	 * Connect or get an existing websocket connection
	 * @param namespace The namespace to connect to
	 * @param url The base ws url
	 * @returns A `WebSocketSubject<any>` for the caller to subscribe to. Use `.pipe(retry(...?)).subscribe(...)` to auto-reconnect on disconnect
	 */
	public connect(namespace: string, url?: string): WebSocketSubject<any> | null {
		if (!url) {
			url = this.baseWSServer;
			if (!url) {
				throw new Error('No valid WS server defined. Either define it with `connect(namespace, url)` and/or with `apiServer` environment variable (`apiServer` must be defined anyway for SEPHIRA to work)');
			}
		}
		for (let i = 0; i < this.sockets.length; i++) {
			const socket = this.sockets[i];
			if (socket.namespace === namespace && socket.url === url) {
				return socket.socket;
			}
		}
		const socket: SocketEl = {
			namespace,
			url,
			socket: webSocket(url + namespace)
		};
		this.sockets.push(socket);
		return socket.socket;
	}

	/**
	 * Just to make it simpler for the programmer. Closes all ws subscribers for the supplied socket
	 * @param websocket The websocket to close
	 */
	close(websocket: WebSocketSubject<any>): void {
		websocket.unsubscribe();
		this.prune();
	}

	/**
	 * Just to make it simpler for the programmer. `message` intentitally left `any` as `websocket.next(...)` allows every type I tested
	 * @param websocket The websocket to sent on
	 * @param message The message to send
	 */
	public send(websocket: WebSocketSubject<any>, message: any): void {
		websocket.next(message);
	}

	/**
	 * Create a payload with `type` as 'auth' and `payload` as the accessToken cookie
	 * @returns The auth payload
	 */
	public createAuthPayload(): Payload {
		return this.createPayload('auth', this.cookie.getItem('accessToken'));
	}

	/**
	 * Create a payload
	 * @param type The type of payload
	 * @param payload The payload
	 * @returns A Payload
	 */
	public createPayload(type: string, payload: any): Payload {
		return {
			type,
			payload
		};
	}

	/**
	 * Prune global sockets array by removing closed sockets to improve performance
	 */
	private prune(): void {
		const tmp = [...this.sockets];
		let deleteCount = 0;
		for (let i = 0; i < tmp.length; i++) {
			if (tmp[i].socket.closed) {
				this.sockets.splice(i - deleteCount, 1);
				deleteCount++;
			}
		}
	}

}
