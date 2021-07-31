import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { PlatformService } from 'src/app/core/services/platform.service';
import { Page } from 'src/app/models/page';
import { environment } from 'src/environments/environment';

interface AllPages {
	total: number;
	pages: Page[];
}

@Component({
	selector: 'app-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {

	@Input() searchBar: boolean;
	@Input() samePage: boolean;

	pages: Page[];
	searchForm: FormGroup;

	private querySub: Subscription | undefined;

	constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router, private platformService: PlatformService) {
		this.searchBar = false;
		this.samePage = false;
		this.pages = [];
		this.searchForm = new FormGroup({
			search: new FormControl('', [Validators.required])
		});
	}

	ngOnInit(): void {
		if (this.platformService.isBrowser()) {
			if (!this.searchBar) {
				this.querySub = this.route.queryParams.subscribe(params => {
					const httpParams = new HttpParams().append('search', params.s);
					this.http.get<AllPages>(environment.apiServer + 'page/pages', { params: httpParams }).pipe(map(res => {
						res.pages = res.pages.map(page => {
							page.created = new Date(page.created!);
							page.modified = new Date(page.modified!);
							return page;
						});
						return res;
					})).toPromise().then(searchRes => {
						this.pages = searchRes.pages;
					})
				});
			}
		}
	}

	ngOnDestroy(): void {
		this.querySub?.unsubscribe();
	}

	search(): void {
		const search = this.searchForm.get('search')!.value;
		if (this.samePage) {
			let urlWithoutParams = this.router.parseUrl(this.router.url).root.children['primary']?.segments.map((it: any) => it.path).join('/');
			if (!urlWithoutParams) {
				urlWithoutParams = '/';
			}
			if (search) {
				this.router.navigate([urlWithoutParams], { queryParams: { s: search } });
			} else {
				this.router.navigate([urlWithoutParams]);
			}
		} else {
			this.router.navigate(['/search'], { queryParams: {s: search} });
		}
	}

}
