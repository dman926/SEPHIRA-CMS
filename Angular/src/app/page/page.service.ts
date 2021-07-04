import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Page } from '../models/page';

@Injectable({
	providedIn: 'root'
})
export class PageService {

	private readonly postBase = environment.apiServer + 'page/'

	constructor(private http: HttpClient, private sanitizer: DomSanitizer) { }

	public getPage(slug: string): Observable<Page> {
		const params = new HttpParams().append('slug', slug);
		return this.http.get<Page>(this.postBase + 'page', { params }).pipe(map(page => {
			page.content = this.sanitizer.bypassSecurityTrustHtml(page.content as string);
			page.created = new Date(page.created!);
			page.modified = new Date(page.modified!);
			return page;
		}));
	}

}
