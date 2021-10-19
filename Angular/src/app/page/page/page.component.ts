import { HostListener, OnDestroy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, makeStateKey, TransferState } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PlatformService } from 'src/app/core/services/platform.service';
import { SeoService } from 'src/app/core/services/seo.service';
import { Page } from 'src/app/models/page';
import { environment } from 'src/environments/environment';
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

	constructor(private pageService: PageService, private router: Router, private platformService: PlatformService, private state: TransferState, private sanitizer: DomSanitizer, private seo: SeoService) {
		this.loaded = false;
		this.subs = [];
	}

	ngOnInit(): void {
		if (this.platformService.isServer()) {
			this.fetchPage();
		} else {
			this.page = this.state.get(makeStateKey('page'), undefined);
			if (!this.page || this.page.slug !== this.router.url) {
				this.fetchPage();
			} else if (this.page && this.page.content) {
				if (typeof this.page.content === 'string') {
					this.page.content = this.sanitizer.bypassSecurityTrustHtml(this.page.content as string);
				}
				this.loaded = true;
			}
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
			this.seo.setTitle(this.page.title ? this.page.title : environment.defaultTitle);
			this.seo.updateTag('description', this.page.excerpt ? this.page.excerpt : '');
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

	// Provide routerLink functionality for dynamically created a tags
	@HostListener('document:click', ['$event'])
	public handleClick(event: Event): void {
		if (event.target instanceof HTMLAnchorElement) {
			const el = event.target as HTMLAnchorElement;
			const route = el?.getAttribute('routerLink');
			if (route) {
				event.preventDefault();
				this.router.navigate([route])
			}
		}
	}

}
