import { Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, Observable, shareReplay } from 'rxjs';
import { MatSidenav } from '@angular/material/sidenav';
import { environment } from 'src/environments/environment';


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

	readonly menuStyle: string = environment.menuStyle;

	private swipeCoord: number[];
	private swipeTime: number;

	constructor(private breakpointObserver: BreakpointObserver) {
		this.swipeCoord = [0, 0];
		this.swipeTime = 0;
	}

	ngOnInit(): void {}

	swipe(e: TouchEvent, when: string): void {
		if (!this.sidenav || this.menuStyle === 'top') {
			return;
		}
		const coord: [number, number] = [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
		const time = new Date().getTime();

		if (when === 'start') {
			this.swipeCoord = coord;
			this.swipeTime = time;
		}

		if (this.sidenav.opened) {
			if (when === 'end') {
				const direction = [coord[0] - this.swipeCoord[0], coord[1] - this.swipeCoord[1]];
				const duration = time - this.swipeTime;
				if (duration < 1000 // Long enough
					&& direction[0] < -30 // In the -x direction
					&& Math.abs(direction[0]) > Math.abs(direction[1] * 3)) { // Horizontal enough
					this.sidenav.close();
				}
			}
		} else {
			if (when === 'end') {
				const direction = [coord[0] - this.swipeCoord[0], coord[1] - this.swipeCoord[1]];
				const duration = time - this.swipeTime;
				if (duration < 1000 // Long enough
					&& direction[0] > 30 // In the +x direction
					&& Math.abs(direction[0]) > Math.abs(direction[1] * 3)) { // Horizontal enough
					this.sidenav.open();
				}
			}
		}
	}

}
