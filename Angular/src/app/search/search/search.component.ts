import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { PlatformService } from 'src/app/core/services/platform.service';
import { Page } from 'src/app/models/page';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {

	@Input() searchBar: boolean;

	pages: Page[];
	searchForm: FormGroup;

	private querySub: Subscription | undefined;

	constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router, private platformService: PlatformService) {
		this.searchBar = false;
		this.pages = [];
		this.searchForm = new FormGroup({
			search: new FormControl('', [Validators.required])
		});
	}

	ngOnInit(): void {
		if (this.platformService.isBrowser()) {
			if (!this.searchBar) {
				this.querySub = this.route.queryParams.subscribe(params => {
					console.log(params);
					const httpParams = new HttpParams().append('s', params.s);
					this.http.get<Page[]>(environment.apiServer + 'page/search', { params: httpParams }).pipe(map(pages => pages.map(page => {
						page.created = new Date(page.created!);
						page.modified = new Date(page.modified!);
						return page;
					}))).toPromise().then(searchRes => {
						this.pages = searchRes;
						console.log(this.pages);
					})
				});
			}
		}
	}

	ngOnDestroy(): void {
		this.querySub?.unsubscribe();
	}

	search(): void {
		this.router.navigate(['/search'], { queryParams: {s: this.searchForm.get('search')!.value} });
	}

}
