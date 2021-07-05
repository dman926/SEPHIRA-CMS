import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

	isHandset: boolean;
	selectingMedia: boolean;

	constructor(private breakpointObserver: BreakpointObserver) {
		this.isHandset = false;
		this.selectingMedia = false;
		this.breakpointObserver.observe(Breakpoints.Handset).pipe(
			map(({ matches }) => {
				this.isHandset = matches;
			})
		);
	}

	ngOnInit(): void { }

	onSelectedImage(url: string) {
		console.log(url);
	}

}
