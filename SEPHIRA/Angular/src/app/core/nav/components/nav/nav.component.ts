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
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from 'src/app/models/user';

@Component({
	selector: 'sephira-nav',
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

	isHandset: boolean; // Just for ease of use in the swipe function

	// Making this a dedicated variable because it is more efficient checking
	// once rather than relying on a get function which may fire multiple times
	isAdmin: boolean;

	menuItems: MenuItem[];
	user: User | null;

	readonly siteTitle: string = environment.siteTitle;
	readonly desktopMenuStyle: string = environment.desktopMenuStyle;
	readonly mobileMenuStyle: string = environment.mobileMenuStyle;
	readonly adminPath: string = environment.adminPath;
	readonly shopEnabled: boolean = environment.enableShop;
	readonly adminMenuItems: MenuItem[] = [
		{
			text: 'Home',
			link: this.adminPath,
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
		private snackbar: MatSnackBar,
		public auth: AuthService
	) {
		this.isHandset = false;
		this.isHandset$.subscribe(val => {
			this.isHandset = val;
		});

		this.isAdmin =
			this.router.url.substring(1, this.adminPath.length + 1) ===
			this.adminPath;
		this.menuItems = [];
		this.user = null;

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
			this.auth.user$.subscribe(user => this.user = user);

			this.router.events.subscribe((ev) => {
				if (ev instanceof NavigationEnd) {
					// Page change

					// Recheck if in admin area
					this.isAdmin =
						this.router.url.substring(
							1,
							this.adminPath.length + 1
						) === this.adminPath;
				}
			});
		}
	}

	logout(): void {
		this.auth.logout();
		this.snackbar.open('Logged Out', 'Close', { duration: 2500 });
		this.router.navigate(['/login/redirect'], {
			queryParams: {
				return: this.router.url
			}
		});
	}

	swipe(e: TouchEvent, when: string): void {
		if (!this.sidenav || (this.isHandset ? this.mobileMenuStyle !== 'side' : this.desktopMenuStyle !== 'side')) {
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
