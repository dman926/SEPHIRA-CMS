import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Page } from '../models/page';
import { User } from '../models/user';

@Injectable({
	providedIn: 'root'
})
export class AdminService {

	private readonly adminBase = environment.apiServer + 'admin/';

	constructor(private http: HttpClient) { }

	public getAllUsers(page?: number, size?: number): Observable<User[]> {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			let params = new HttpParams();
			if (page && size) {
				params = params.append('page', page.toString()).append('size', size.toString())
			}
			return this.http.get<User[]>(this.adminBase + 'users', { headers, params });
		} else {
			return new Observable<User[]>();
		}
	}

	public getUser(id: string): Observable<User> {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.get<User>(this.adminBase + 'user/' + id, { headers });
		} else {
			return new Observable<User>();
		}
	}

	public getUserCount(): Observable<number> {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.get<number>(this.adminBase + 'users/count', { headers });
		} else {
			return new Observable<number>();
		}
	}

	public getAllPages(page?: number, size?: number): Observable<Page[]> {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			let params = new HttpParams();
			if (page && size) {
				params = params.append('page', page.toString()).append('size', size.toString())
			}
			return this.http.get<Page[]>(this.adminBase + 'pages', { headers, params }).pipe(map(pages => {
				return pages.map(page => {
					page.created = new Date(page.created!);
					page.modified = new Date(page.modified!);
					return page;
				});
			}));
		} else {
			return new Observable<Page[]>();
		}
	}

	public getPage(id: string): Observable<Page> {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken).append('Accept', 'application/json');
			return this.http.get<Page>(this.adminBase + 'page/' + id, { headers }).pipe(map(page => {
				page.created = new Date(page.created!);
				page.modified = new Date(page.modified!);
				return page;
			}));
		} else {
			return new Observable<Page>();
		}
	}

	public getPageCount(): Observable<number> {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.get<number>(this.adminBase + 'pages/count', { headers });
		} else {
			return new Observable<number>();
		}
	}

	public submitPage(page: Page): Observable<Page> {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.post<Page>(this.adminBase + 'pages', { page }, { headers });
		} else {
			return new Observable<Page>();
		}
	}

	public checkIfSlugTaken(slug: string): Observable<string> {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken).append('Accept', 'application/json');
			const params = new HttpParams().append('slug', slug)
			return this.http.get<string>(this.adminBase + 'pages/slugTaken', { headers, params });
		} else {
			return new Observable<string>();
		}
	}

}
