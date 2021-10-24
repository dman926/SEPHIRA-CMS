import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { MenuItem } from '../models/menu-item';
import { Order } from '../models/order';
import { Post } from '../models/post';
import { PostSchema } from '../models/post-schema';
import { ShippingZone } from '../models/shipping-zone';
import { User } from '../models/user';
import { File } from './models/file';

interface AllPosts {
	count: number;
	posts: Post[];
}

interface SchemaPost {
	obj: Post;
	schema?: PostSchema[];
}

@Injectable({
	providedIn: 'root'
})
export class AdminService {

	private readonly adminBase = environment.apiServer + 'admin/';

	constructor(private http: HttpClient, private cookie: CookieService) { }

	public getAllUsers(page?: number, size?: number): Observable<User[]> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
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
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.get<User>(this.adminBase + 'user/' + id, { headers });
		} else {
			return new Observable<User>();
		}
	}

	public getUserCount(): Observable<number> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.get<number>(this.adminBase + 'users/count', { headers });
		} else {
			return new Observable<number>();
		}
	}

	public getPostTypes(): Observable<string[]> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.get<string[]>(this.adminBase + 'posts/types', { headers });
		} else {
			return new Observable<string[]>();
		}
	}

	public getPostSchema(postType: string): Observable<object> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			const params = new HttpParams().append('post', postType);
			return this.http.get<object>(this.adminBase + 'posts/schema', { headers, params });
		} else {
			return new Observable<object>();
		}
	}

	public getAllPosts(postType: string, page?: number, size?: number, search?: string): Observable<AllPosts> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			let params = new HttpParams().append('post', postType);
			if (page && size) {
				params = params.append('page', page.toString()).append('size', size.toString())
			}
			if (search) {
				params = params.append('search', search);
			}
			return this.http.get<AllPosts>(this.adminBase + 'posts', { headers, params }).pipe(map(posts => {
				posts.posts = posts.posts.map(post => {
					post.created = new Date(post.created!);
					post.modified = new Date(post.modified!);
					return post;
				});
				return posts;
			}));
		} else {
			return new Observable<AllPosts>();
		}
	}

	public getPost(postType: string, id: string, withSchema?: boolean): Observable<SchemaPost> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			let params = new HttpParams().append('post', postType);
			if (withSchema) {
				params = params.append('withSchema', true);
			}
			return this.http.get<SchemaPost>(this.adminBase + 'post/' + id, { headers, params }).pipe(map(post => {
				post.obj.created = new Date(post.obj.created!);
				post.obj.modified = new Date(post.obj.modified!);
				return post;
			}));
		} else {
			return new Observable<SchemaPost>();
		}
	}


	public submitPost(postType: string, post: Post): Observable<Post> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.post<Post>(this.adminBase + 'posts', {post: postType, obj: post}, { headers });
		} else {
			return new Observable<Post>();
		}
	}

	public editPost(postType: string, post: Post): Observable<string> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.put<string>(this.adminBase + 'post/' + post.id, {post: postType, obj: post}, { headers });
		} else {
			return new Observable<string>();
		}
	}

	public deletePost(postType: string, id: string): Observable<string> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			const params = new HttpParams().append('post', postType);
			return this.http.delete<string>(this.adminBase + 'post/' + id, { headers, params });
		} else {
			return new Observable<string>();
		}
	}

	public checkPostSlugTaken(postType: string, slug: string): Observable<string> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken).append('Accept', 'application/json');
			const params = new HttpParams().append('post', postType).append('slug', slug)
			return this.http.get<string>(this.adminBase + 'posts/slugTaken', { headers, params });
		} else {
			return new Observable<string>();
		}
	}


	public getAllOrders(page?: number, size?: number): Observable<Order[]> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			let params = new HttpParams();
			if (page && size) {
				params = params.append('page', page.toString()).append('size', size.toString())
			}
			return this.http.get<Order[]>(this.adminBase + 'orders', { headers, params });
		} else {
			return new Observable<Order[]>();
		}
	}

	public getOrder(id: string): Observable<Order> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.get<Order>(this.adminBase + 'orders/' + id, { headers });
		} else {
			return new Observable<Order>();
		}
	}

	public getOrderCount(): Observable<number> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.get<number>(this.adminBase + 'orders/count', { headers });
		} else {
			return new Observable<number>();
		}
	}

	public deleteOrder(id: string): Observable<string> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.delete<string>(this.adminBase + 'order/' + id, { headers });
		} else {
			return new Observable<string>();
		}
	}

	public getAllShippingZones(page?: number, size?: number): Observable<ShippingZone[]> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			let params = new HttpParams();
			if (page && size) {
				params = params.append('page', page.toString()).append('size', size.toString())
			}
			return this.http.get<ShippingZone[]>(this.adminBase + 'usShippingZones', { headers, params });
		} else {
			return new Observable<ShippingZone[]>();
		}
	}

	public getShippingZone(id: string): Observable<ShippingZone> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.get<ShippingZone>(this.adminBase + 'usShippingZone/' + id, { headers });
		} else {
			return new Observable<ShippingZone>();
		}
	}

	public getShippingZoneCount(): Observable<number> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.get<number>(this.adminBase + 'usShippingZones/count', { headers });
		} else {
			return new Observable<number>();
		}
	}

	public submitShippingZone(shippingZone: ShippingZone): Observable<ShippingZone> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.post<ShippingZone>(this.adminBase + 'usShippingZones', shippingZone, { headers });
		} else {
			return new Observable<ShippingZone>();
		}
	}

	public editShippingZone(shippingZone: ShippingZone): Observable<string> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.put<string>(this.adminBase + 'usShippingZone/' + shippingZone.id, shippingZone, { headers });
		} else {
			return new Observable<string>();
		}
	}

	public deleteShippingZone(id: string): Observable<string> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.delete<string>(this.adminBase + 'usShippingZone/' + id, { headers });
		} else {
			return new Observable<string>();
		}
	}

	public getMenuItems(): Observable<MenuItem[]> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.get<MenuItem[]>(this.adminBase + 'menuItems', { headers });
		} else {
			return new Observable<MenuItem[]>();
		}
	}

	public saveMenuItems(menuItems: MenuItem[]): Observable<MenuItem[]> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.post<MenuItem[]>(this.adminBase + 'menuItems', menuItems, { headers });
		} else {
			return new Observable<MenuItem[]>();
		}
	}

	public getBackendFiles(): Observable<File[]> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.get<File[]>(this.adminBase + 'backend-editor/files', { headers });
		} else {
			return new Observable<File[]>();
		}
	}

	public getBackendFile(path: string): Observable<string> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			const params = new HttpParams().append('path', path);
			return this.http.get<string>(this.adminBase + 'backend-editor/file', { headers, params });
		} else {
			return new Observable<string>();
		}
	}

	public saveBackendFile(path: string, content: string): Observable<string> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.put<string>(this.adminBase + 'backend-editor/file', { path, content }, { headers });
		} else {
			return new Observable<string>();
		}
	}

	public restartServer(): Observable<string> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.post<string>(this.adminBase + 'server/restart', {}, { headers });
		} else {
			return new Observable<string>();
		}
	}

}
