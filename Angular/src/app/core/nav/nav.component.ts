import { Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user';
import { NavigationEnd, Router } from '@angular/router';
import { WebsocketService } from '../services/websocket.service';
import { environment } from 'src/environments/environment';
import { io } from 'socket.io-client';
import { CookieService } from 'ngx-cookie';
import { CartService } from 'src/app/payment/cart/cart.service';
import { HttpClient } from '@angular/common/http';
import { MenuItem } from 'src/app/models/menu-item';
import { PlatformService } from '../services/platform.service';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { GoogleTagManagerService } from 'angular-google-tag-manager';
import { SeoService } from '../services/seo.service';

interface LinkPair {
	link: string;
	text: string;
}

@Component({
	selector: 'app-nav',
	templateUrl: './nav.component.html',
	styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

	@ViewChild('drawer') public sidenav: MatSidenav | undefined;

	isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
		.pipe(
			map(result => result.matches),
			shareReplay()
		);

	links: LinkPair[];

	user: User | null;

	menuItems: MenuItem[];

	private swipeCoord: number[];
	private swipeTime: number;

	constructor(private breakpointObserver: BreakpointObserver, private auth: AuthService, private cartService: CartService, private router: Router, private ws: WebsocketService, private cookie: CookieService, private http: HttpClient, private platformService: PlatformService, private state: TransferState, private gtmService: GoogleTagManagerService, private seo: SeoService) {
		this.user = null;
		this.auth.user$.subscribe(user => {
			this.user = user;
		});
		this.links = [
			{
				link: 'shop',
				text: 'Shop'
			}
		];
		this.menuItems = [];
		this.swipeCoord = [0, 0];
		this.swipeTime = 0;
	}

	ngOnInit(): void {
		const menuKey = makeStateKey('menu');
		if (this.platformService.isServer()) {
			this.http.get<MenuItem[]>(environment.apiServer + 'menuItems').toPromise().then(items => {
				this.menuItems = items;
				this.state.set<MenuItem[]>(menuKey, items);
			});
		} else {
			this.menuItems = this.state.get<MenuItem[]>(menuKey, []);

			this.router.events.subscribe(ev => {
				if (ev instanceof NavigationEnd) {
					this.seo.setCanonicalUrl();
					this.gtmService.pushTag({
						event: 'page',
						pageName: ev.url
					});
				}
			});
		}
	}

	isSignedIn(): boolean {
		return this.cookie.hasKey('accessToken');
	}

	logout(): void {
		this.auth.setUser(null);
		this.cookie.remove('accessToken');
		this.cookie.remove('refreshToken');
		this.cartService.clearCart(); // Remove this line if you want the cart to persist after log out
		this.ws.killSocket();
		const accessToken = this.cookie.get('accessToken');
		let socket;
		if (accessToken) {
			socket = io(environment.socketServer, {
				extraHeaders: {
					Authorization: 'Bearer ' + accessToken
				}
			});
		} else {
			socket = io(environment.socketServer);
		}
		this.ws.setSocket(socket);
		this.router.navigate(['/']);
	}

	swipe(e: TouchEvent, when: string): void {
		const coord: [number, number] = [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
		const time = new Date().getTime();

		if (when === 'start') {
			this.swipeCoord = coord;
			this.swipeTime = time;
		} else if (when === 'end') {
			const direction = [coord[0] - this.swipeCoord[0], coord[1] - this.swipeCoord[1]];
			const duration = time - this.swipeTime;
			if (duration < 1000 //
				&& direction[0] > 30 // Long enough
				&& Math.abs(direction[0]) > Math.abs(direction[1] * 3)) { // Horizontal enough
				const swipe = direction[0] < 0 ? 'next' : 'previous';
				if (this.sidenav) {
					this.sidenav.open();
				}
			}
		}
	}

}
