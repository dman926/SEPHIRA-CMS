import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { CoreService } from 'src/app/core/services/core/core.service';
import { MenuItem } from 'src/app/models/menu-item';
import { Order } from 'src/app/models/order';
import { Post, PostSchema } from 'src/app/models/posts/post';
import { ShippingZone } from 'src/app/models/shipping-zone';
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

interface AllOrders {
	count: number;
	orders: Order[];
}

interface AllShippingZone {
	count: number;
	shippingZones: ShippingZone[];
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
			let params = new HttpParams().append('post', postType);
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

	public checkPostSlugTaken(postType: string, slug: string): Observable<boolean> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			const params = new HttpParams().append('post', postType).append('slug', slug);
			return this.http.get<boolean>(this.adminBase + 'post/slugTaken', { headers, params });
		} else {
			return EMPTY;
		}
	}

	public getAllOrders(page?: number, size?: number): Observable<AllOrders> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			let params = new HttpParams();
			if (page && size) {
				params = params.append('page', page).append('size', size);
			}
			return this.http.get<AllOrders>(this.adminBase + 'orders', { headers, params });
		} else {
			return EMPTY;
		}
	}

	public getOrder(id: string): Observable<Order> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			return this.http.get<Order>(this.adminBase + 'orders/' + id, { headers });
		} else {
			return new Observable<Order>();
		}
	}

	public deleteOrder(id: string): Observable<string> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			return this.http.delete<string>(this.adminBase + 'order/' + id, { headers });
		} else {
			return new Observable<string>();
		}
	}

	public getAllShippingZones(page?: number, size?: number): Observable<AllShippingZone> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			let params = new HttpParams();
			if (page && size) {
				params = params.append('page', page.toString()).append('size', size.toString())
			}
			return this.http.get<AllShippingZone>(this.adminBase + 'usShippingZones', { headers, params });
		} else {
			return new Observable<AllShippingZone>();
		}
	}

	public getShippingZone(id: string): Observable<ShippingZone> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			return this.http.get<ShippingZone>(this.adminBase + 'usShippingZone/' + id, { headers });
		} else {
			return new Observable<ShippingZone>();
		}
	}

	public submitShippingZone(shippingZone: ShippingZone): Observable<ShippingZone> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			return this.http.post<ShippingZone>(this.adminBase + 'usShippingZones', shippingZone, { headers });
		} else {
			return new Observable<ShippingZone>();
		}
	}

	public editShippingZone(shippingZone: ShippingZone): Observable<string> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			return this.http.put<string>(this.adminBase + 'usShippingZone/' + shippingZone.id, shippingZone, { headers });
		} else {
			return new Observable<string>();
		}
	}

	public deleteShippingZone(id: string): Observable<string> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			return this.http.delete<string>(this.adminBase + 'usShippingZone/' + id, { headers });
		} else {
			return new Observable<string>();
		}
	}

	public getMenuItems(): Observable<MenuItem[]> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			return this.http.get<MenuItem[]>(this.adminBase + 'menuItems', { headers });
		} else {
			return new Observable<MenuItem[]>();
		}
	}

	public saveMenuItems(menuItems: MenuItem[]): Observable<string> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			return this.http.post<string>(this.adminBase + 'menuItems', { menuItems }, { headers });
		} else {
			return new Observable<string>();
		}
	}

}
