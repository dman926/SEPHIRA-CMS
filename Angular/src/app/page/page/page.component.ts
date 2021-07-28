import { OnDestroy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, makeStateKey, TransferState } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PlatformService } from 'src/app/core/services/platform.service';
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

	constructor(private pageService: PageService, private router: Router, private platformService: PlatformService, private state: TransferState, private sanitizer: DomSanitizer) {
		this.loaded = false;
		this.subs = [];
	}

	ngOnInit(): void {
		if (this.platformService.isServer()) {
			this.fetchPage();
		}
		if (this.platformService.isBrowser()) {
			this.page = this.state.get(makeStateKey('page'), undefined);
			if (this.page && this.page.content) {
				this.page.content = this.sanitizer.bypassSecurityTrustHtml(this.page.content as string);
			}
			this.loaded = true;
			this.subs.push(this.router.events.subscribe(ev => {
				if (ev instanceof NavigationEnd) {
					this.fetchPage();
				}
			}));
		}
	}

	ngOnDestroy(): void {
		this.subs.forEach(sub => sub.unsubscribe());
	}

	private fetchPage(): void {
		this.loaded = false;
		this.pageService.getPage(this.router.url).toPromise().then(page => {
			this.page = page;
			if (this.platformService.isServer()) {
				this.state.set<Page>(makeStateKey('page'), page);
			} else if (this.page && this.page.content) {
				this.page.content = this.sanitizer.bypassSecurityTrustHtml(this.page.content as string);
			}
			this.loaded = true;
		}).catch(err => {
			if (err.status === 404) {
				this.loaded = true;
			}
		});
	}

}
