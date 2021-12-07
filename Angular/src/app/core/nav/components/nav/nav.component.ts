import { Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, Observable, shareReplay } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';
import { environment } from 'src/environments/environment';
import { PlatformService } from '../../../services/platform/platform.service';
import { MenuItem } from 'src/app/models/menu-item';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { MenuItemService } from '../../services/menu-item/menu-item.service';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/features/auth/services/auth/auth.service';

@Component({
	selector: 'app-nav',
	templateUrl: './nav.component.html',
	styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {
	@ViewChild('drawer') private sidenav: MatSidenav | undefined;

	isHandset$: Observable<boolean> = this.breakpointObserver
		.observe(Breakpoints.Handset)
		.pipe(
			map((result) => result.matches),
			shareReplay()
		);

	// Making this a dedicated variable because it is more efficient checking
	// once rather than relying on a get function which may fire multiple times
	isAdmin: boolean;

	menuItems: MenuItem[];

	readonly siteTitle: string = environment.siteTitle;
	readonly menuStyle: string = environment.menuStyle;
	readonly adminMenuItems: MenuItem[] = [
		{
			text: 'Home',
			link: environment.adminPath,
		},
		{
			text: 'View Site',
			link: '',
		}
	];

	private swipeCoord: number[];
	private swipeTime: number;

	constructor(
		private breakpointObserver: BreakpointObserver,
		private menuItemService: MenuItemService,
		private platform: PlatformService,
		private state: TransferState,
		private router: Router,
		public auth: AuthService
	) {
		this.isAdmin =
			this.router.url.substr(1, environment.adminPath.length) ===
			environment.adminPath;
		this.menuItems = [];

		this.swipeCoord = [0, 0];
		this.swipeTime = 0;
	}

	ngOnInit(): void {
		const menuItemsKey = makeStateKey('menuItems');
		if (this.platform.isServer) {
			this.menuItemService.getMenuItems().subscribe((items) => {
				this.menuItems = items;
				this.state.set<MenuItem[]>(menuItemsKey, items);
			});
		} else {
			this.menuItems = this.state.get<MenuItem[]>(menuItemsKey, []);

			this.router.events.subscribe((ev) => {
				if (ev instanceof NavigationEnd) {
					// Page change

					// Recheck if in admin area
					this.isAdmin =
						this.router.url.substr(
							1,
							environment.adminPath.length
						) === environment.adminPath;
				}
			});
		}
	}

	swipe(e: TouchEvent, when: string): void {
		if (!this.sidenav || this.menuStyle !== 'side') {
			return;
		}
		const coord: [number, number] = [
			e.changedTouches[0].clientX,
			e.changedTouches[0].clientY,
		];
		const time = new Date().getTime();

		if (when === 'start') {
			this.swipeCoord = coord;
			this.swipeTime = time;
		}

		if (this.sidenav.opened) {
			if (when === 'end') {
				const direction = [
					coord[0] - this.swipeCoord[0],
					coord[1] - this.swipeCoord[1],
				];
				const duration = time - this.swipeTime;
				if (
					duration < 1000 && // Long enough
					direction[0] < -30 && // In the -x direction
					Math.abs(direction[0]) > Math.abs(direction[1] * 3)
				) {
					// Horizontal enough
					this.sidenav.close();
				}
			}
		} else {
			if (when === 'end') {
				const direction = [
					coord[0] - this.swipeCoord[0],
					coord[1] - this.swipeCoord[1],
				];
				const duration = time - this.swipeTime;
				if (
					duration < 1000 && // Long enough
					direction[0] > 30 && // In the +x direction
					Math.abs(direction[0]) > Math.abs(direction[1] * 3)
				) {
					// Horizontal enough
					this.sidenav.open();
				}
			}
		}
	}
}
