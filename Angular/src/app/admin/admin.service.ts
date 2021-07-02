import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Post } from '../models/post';
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

	public getAllPosts(page?: number, size?: number): Observable<Post[]> {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			let params = new HttpParams();
			if (page && size) {
				params = params.append('page', page.toString()).append('size', size.toString())
			}
			return this.http.get<Post[]>(this.adminBase + 'posts', { headers, params }).pipe(map(posts => {
				return posts.map(post => {
					post.created = new Date(post.created!);
					post.modified = new Date(post.modified!);
					return post;
				});
			}));
		} else {
			return new Observable<Post[]>();
		}
	}

	public getPost(id: string): Observable<Post> {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken).append('Accept', 'application/json');
			return this.http.get<Post>(this.adminBase + 'post/' + id, { headers }).pipe(map(post => {
				post.created = new Date(post.created!);
				post.modified = new Date(post.modified!);
				return post;
			}));
		} else {
			return new Observable<Post>();
		}
	}

	public getPostCount(): Observable<number> {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.get<number>(this.adminBase + 'posts/count', { headers });
		} else {
			return new Observable<number>();
		}
	}

	public submitPost(post: Post): Observable<Post> {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.post<Post>(this.adminBase + 'posts', { post }, { headers });
		} else {
			return new Observable<Post>();
		}
	}

	public checkIfSlugTaken(slug: string): Observable<string> {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken).append('Accept', 'application/json');
			const params = new HttpParams().append('slug', slug)
			return this.http.get<string>(this.adminBase + 'posts/slugTaken', { headers, params });
		} else {
			return new Observable<string>();
		}
	}

}
