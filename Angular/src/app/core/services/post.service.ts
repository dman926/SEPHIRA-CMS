import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { Observable } from 'rxjs';
import { Post } from 'src/app/models/post';
import { environment } from 'src/environments/environment';

interface AllPosts {
	total: number;
	posts: Post[];
}

@Injectable({
	providedIn: 'root'
})
export class PostService {

	private readonly postBase = environment.apiServer + 'post/';

	constructor(private http: HttpClient, private cookie: CookieService) { }

	public getPosts(postType: string, page?: number, size?: number, search?: string): Observable<AllPosts> {
		const accessToken = this.cookie.get('accessToken');
		let headers = new HttpHeaders();
		if (accessToken && accessToken !== 'undefined') {
			headers = headers.append('Authorization', 'Bearer ' + accessToken);
		}
		let params = new HttpParams().append('post', postType);
		if (page && size) {
			params = params.append('page', page).append('size', size);
		}
		if (search) {
			params = params.append('search', search);
		}
		return this.http.get<AllPosts>(this.postBase + 'posts', { headers, params });
	}

	public getPostFromID(postType: string, id: string): Observable<Post> {
		const accessToken = this.cookie.get('accessToken');
		let headers = new HttpHeaders();
		if (accessToken && accessToken !== 'undefined') {
			headers = headers.append('Authorization', 'Bearer ' + accessToken);
		}
		let params = new HttpParams().append('post', postType).append('id', id);
		return this.http.get<Post>(this.postBase + 'post/id', { headers, params });
	}

	public getPostFromSlug(postType: string, slug: string): Observable<Post> {
		const accessToken = this.cookie.get('accessToken');
		let headers = new HttpHeaders();
		if (accessToken && accessToken !== 'undefined') {
			headers = headers.append('Authorization', 'Bearer ' + accessToken);
		}
		let params = new HttpParams().append('post', postType).append('slug', slug);
		return this.http.get<Post>(this.postBase + 'post/slug', { headers, params });
	}

}
