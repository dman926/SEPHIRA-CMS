import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { CoreService } from 'src/app/core/services/core/core.service';
import { Post, PostSchema } from 'src/app/models/post';
import { User } from 'src/app/models/user';
import { environment } from 'src/environments/environment';

interface AllPosts {
	count: number;
	posts: Post[];
}

interface SchemaPost {
	obj: Post;
	schema?: PostSchema[];
}

@Injectable({
	providedIn: 'root',
})
export class AdminService {

	private readonly adminBase = environment.apiServer + 'admin/';

	constructor(private http: HttpClient, private core: CoreService) {}

	public getAllUsers(page?: number, size?: number): Observable<User[]> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			let params = new HttpParams();
			if (page && size) {
				params = params.append('page', page).append('size', size);
			}
			return this.http.get<User[]>(this.adminBase + 'users', { headers });
		} else {
			return EMPTY;
		}
	}

	public getUser(id: string): Observable<User> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			return this.http.get<User>(this.adminBase + 'user/' + id, { headers });
		} else {
			return EMPTY;
		}
	}

	public getPostTypes(): Observable<string[]> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			return this.http.get<string[]>(this.adminBase + 'posts/types', { headers });
		} else {
			return EMPTY;
		}
	}

	public getPostSchema(postType: string): Observable<object> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			const params = new HttpParams().append('post', postType);
			return this.http.get<object>(this.adminBase + 'posts/schema', { headers, params });
		} else {
			return EMPTY;
		}
	}

	public getAllPosts(postType: string, page?: number, size?: number, search?: string): Observable<AllPosts> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			let params = new HttpParams();
			if (page && size) {
				params = params.append('page', page).append('size', size);
			}
			if (search) {
				params = params.append('search', search);
			}
			return this.http.get<AllPosts>(this.adminBase + 'posts', { headers, params });
		} else {
			return EMPTY;
		}
	}

	public getPost(postType: string, id: string, withSchema?: boolean): Observable<SchemaPost> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			const params = new HttpParams().append('post', postType).append('withSchema', withSchema ? true : false);
			return this.http.get<SchemaPost>(this.adminBase + 'post/' + id, { headers, params });
		} else {
			return EMPTY;
		}
	}

	public submitPost(postType: string, post: Post): Observable<Post> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			return this.http.post<Post>(this.adminBase + 'posts', { post: postType, obj: post }, { headers });
		} else {
			return EMPTY;
		}
	}

	public editPost(postType: string, post: Post): Observable<Post> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			return this.http.put<Post>(this.adminBase + 'post/' + post.id, { post: postType, obj: post }, { headers });
		} else {
			return EMPTY;
		}
	}

	public deletePost(postType: string, id: string): Observable<string> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			return this.http.delete<string>(this.adminBase + 'post/' + id, { headers });
		} else {
			return EMPTY;
		}
	}

}
