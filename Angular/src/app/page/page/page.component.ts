import { OnDestroy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Page } from 'src/app/models/page';
import { PageService } from '../page.service';

@Component({
	selector: 'app-page',
	templateUrl: './page.component.html',
	styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit, OnDestroy {

	loaded: boolean;
	page: Page | undefined;

	private subs: Subscription[];

	constructor(private pageService: PageService, private router: Router) {
		this.loaded = false;
		this.subs = [];
	}

	ngOnInit(): void {
		this.fetchPage();
		this.router.events.subscribe(ev => {
			if (ev instanceof NavigationEnd) {
				this.fetchPage();
			}
		})
	}

	ngOnDestroy(): void {
		this.subs.forEach(sub => sub.unsubscribe());
	}

	private fetchPage(): void {
		this.loaded = false;
		this.pageService.getPage(this.router.url).toPromise().then(page => {
			this.page = page;
			this.loaded = true;
		}).catch(err => {
			if (err.status === 404) {
				this.loaded = true;
			}
		});
	}

}
