import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Page } from 'src/app/models/page';
import { PageService } from '../page.service';

@Component({
	selector: 'app-page',
	templateUrl: './page.component.html',
	styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit {

	loaded: boolean;
	page: Page | undefined;

	constructor(private pageService: PageService, private router: Router, private sanitizer: DomSanitizer) {
		this.loaded = false;
	}

	ngOnInit(): void {
		this.pageService.getPage(this.router.url).toPromise().then(page => {
			this.page = page;
			this.loaded = true;
		}).catch(err => {
			if (err.status === 404) {
				this.loaded = true;
			}
		})
	}

}
