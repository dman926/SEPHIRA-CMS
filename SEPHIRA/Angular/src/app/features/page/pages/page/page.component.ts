import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, makeStateKey, TransferState } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { PostService } from 'src/app/core/services/post/post.service';
import { Page } from 'src/app/models/posts/page';

@Component({
	selector: 'app-page',
	templateUrl: './page.component.html',
	styleUrls: ['./page.component.scss'],
})
export class PageComponent implements OnInit, OnDestroy {

	loaded: boolean;
	page: Page | null;

	private routerSub: Subscription | null;
	private readonly pageStateKey = makeStateKey<Page>('page');

	// TODO:
	// For some reason, this component always fires for root if not on a dynamic page
	// Could have a potential performance improvement, but it's only server-side, so I don't relly care right now
	constructor(private postService: PostService, private platform: PlatformService, private state: TransferState, private sanitizer: DomSanitizer, private router: Router) {
		this.loaded = false;
		this.page = null;
		this.routerSub = null;
	}

	ngOnInit(): void {
		if (this.platform.isServer) {
			this.fetchPage();
		} else {
			this.page = this.state.get(this.pageStateKey, null);
			if (!this.page || this.page.slug !== this.router.url) {
				this.fetchPage();
			} else if (this.page) {
				if (this.page.content && typeof this.page.content === 'string') {
					this.page.content = this.sanitizer.bypassSecurityTrustHtml(this.page.content as string);
				}
				this.loaded = true;
			} else {
				this.fetchPage();
			}
			this.loaded = true;
			this.routerSub = this.router.events.subscribe(ev => {
				if (ev instanceof NavigationEnd) {
					this.fetchPage();
				}
			});
		}
	}

	ngOnDestroy(): void {
		this.routerSub?.unsubscribe();
	}

	private fetchPage(): void {
		this.loaded = false;
		this.postService.getPostFromSlug('models.Page', this.router.url).subscribe({
			next: page => {
				this.state.set(this.pageStateKey, page);
				// Do it this way instead of direct assignment because sanitization doesn't work correctly with TransferState.
				// So make a copy of the object instead.
				this.page = {...page};
				if (this.page && this.page.content && typeof this.page.content === 'string') {
					this.page.content = this.sanitizer.bypassSecurityTrustHtml(this.page.content as string);
				}
				this.loaded = true;
			},
			error: err => {
				this.page = null;
				this.state.set(this.pageStateKey, null);
				if (err.status === 404) {
					this.loaded = true;
				}
			}
		})
	}

}
