import { Component, OnInit } from '@angular/core';
import { DomSanitizer, makeStateKey, TransferState } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { PostService } from 'src/app/core/services/post/post.service';
import { Page } from 'src/app/models/posts/page';

@Component({
	selector: 'app-page',
	templateUrl: './page.component.html',
	styleUrls: ['./page.component.scss'],
})
export class PageComponent implements OnInit {

	loaded: boolean;
	page: Page | null;

	private readonly pageStateKey = makeStateKey<Page>('page');

	constructor(private postService: PostService, private platform: PlatformService, private state: TransferState, private sanitizer: DomSanitizer, private router: Router) {
		this.loaded = false;
		this.page = null;
	}

	ngOnInit(): void {
		if (this.platform.isServer) {
			this.fetchPage();
		} else {
			this.page = this.state.get(this.pageStateKey, null);
			if (this.page && this.page.slug !== this.router.url) {
				this.page.content = this.sanitizer.bypassSecurityTrustHtml(this.page.content as string);
			}
			this.loaded = true;
		}
		this.router.events.subscribe(ev => {
			if (ev instanceof NavigationEnd) {
				this.fetchPage();
			}
		});
	}

	private fetchPage(): void {
		this.loaded = false;
		this.postService.getPostFromSlug('models.Page', this.router.url).subscribe({
			next: page => {
				this.page = page;
				this.state.set(this.pageStateKey, page);
				if (this.page && this.page.content) {
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
