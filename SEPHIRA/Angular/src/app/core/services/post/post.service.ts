import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Post } from 'src/app/models/posts/post';
import { environment } from 'src/environments/environment';
import { CoreService } from '../core/core.service';

interface AllPosts {
	total: number;
	posts: Post[];
}

@Injectable({
	providedIn: 'root',
})
export class PostService {

	private readonly postBase = environment.apiServer + 'post/';

	constructor(private core: CoreService, private http: HttpClient) {}

	public getPosts(postType: string, page?: number, size?: number, search?: string): Observable<AllPosts> {
		let headers = this.core.createAuthHeader();
		if (!headers) {
			headers = new HttpHeaders();
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
		let headers = this.core.createAuthHeader();
		if (!headers) {
			headers = new HttpHeaders();
		}
		let params = new HttpParams().append('post', postType).append('id', id);
		return this.http.get<Post>(this.postBase + 'post/id', { headers, params });
	}

	public getPostFromSlug(postType: string, slug: string): Observable<Post> {
		let headers = this.core.createAuthHeader();
		if (!headers) {
			headers = new HttpHeaders();
		}
		const params = new HttpParams().append('post', postType).append('slug', slug);
		return this.http.get<Post>(this.postBase + 'post/slug', { headers, params });
	}

	public isSlugTaken(postType: string, slug: string): Observable<boolean | string> {
		const params = new HttpParams().append('post', postType).append('slug', slug);
		return this.http.get<boolean | string>(environment.apiServer + 'post/posts/slugTaken', { params });
	}

}
