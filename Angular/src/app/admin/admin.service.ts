import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Coupon } from '../models/coupon';
import { MenuItem } from '../models/menu-item';
import { Order } from '../models/order';
import { Page } from '../models/page';
import { Product } from '../models/product';
import { ShippingZone } from '../models/shipping-zone';
import { User } from '../models/user';

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

	public getAllPages(page?: number, size?: number): Observable<Page[]> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
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
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
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
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.get<number>(this.adminBase + 'pages/count', { headers });
		} else {
			return new Observable<number>();
		}
	}

	public submitPage(page: Page): Observable<Page> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.post<Page>(this.adminBase + 'pages', page, { headers });
		} else {
			return new Observable<Page>();
		}
	}

	public editPage(page: Page): Observable<string> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.put<string>(this.adminBase + 'page/' + page.id, page, { headers });
		} else {
			return new Observable<string>();
		}
	}

	public deletePage(id: string): Observable<string> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.delete<string>(this.adminBase + 'page/' + id, { headers });
		} else {
			return new Observable<string>();
		}
	}

	public checkPageSlugTaken(slug: string): Observable<string> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken).append('Accept', 'application/json');
			const params = new HttpParams().append('slug', slug)
			return this.http.get<string>(this.adminBase + 'pages/slugTaken', { headers, params });
		} else {
			return new Observable<string>();
		}
	}

	public getAllProducts(page?: number, size?: number): Observable<Product[]> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			let params = new HttpParams();
			if (page && size) {
				params = params.append('page', page.toString()).append('size', size.toString())
			}
			return this.http.get<Product[]>(this.adminBase + 'products', { headers, params }).pipe(map(products => {
				return products.map(product => {
					product.created = new Date(product.created!);
					product.modified = new Date(product.modified!);
					return product;
				});
			}));
		} else {
			return new Observable<Product[]>();
		}
	}

	public getProduct(id: string): Observable<Product> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.get<Product>(this.adminBase + 'product/' + id, { headers }).pipe(map(page => {
				page.created = new Date(page.created!);
				page.modified = new Date(page.modified!);
				return page;
			}));
		} else {
			return new Observable<Product>();
		}
	}

	public editProduct(product: Product): Observable<string> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.put<string>(this.adminBase + 'product/' + product.id, product, { headers });
		} else {
			return new Observable<string>();
		}
	}

	public getProductCount(): Observable<number> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.get<number>(this.adminBase + 'products/count', { headers });
		} else {
			return new Observable<number>();
		}
	}

	public submitProduct(product: Product): Observable<Product> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.post<Product>(this.adminBase + 'products', product, { headers });
		} else {
			return new Observable<Product>();
		}
	}

	public deleteProduct(id: string): Observable<string> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.delete<string>(this.adminBase + 'product/' + id, { headers });
		} else {
			return new Observable<string>();
		}
	}

	public checkProductSlugTaken(slug: string): Observable<string> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken).append('Accept', 'application/json');
			const params = new HttpParams().append('slug', slug)
			return this.http.get<string>(this.adminBase + 'products/slugTaken', { headers, params });
		} else {
			return new Observable<string>();
		}
	}

	public getAllCoupons(page?: number, size?: number): Observable<Coupon[]> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			let params = new HttpParams();
			if (page && size) {
				params = params.append('page', page.toString()).append('size', size.toString())
			}
			return this.http.get<Coupon[]>(this.adminBase + 'coupons', { headers, params }).pipe(map(coupons => {
				return coupons.map(coupon => {
					coupon.created = new Date(coupon.created!);
					coupon.modified = new Date(coupon.modified!);
					return coupon;
				});
			}));
		} else {
			return new Observable<Coupon[]>();
		}
	}

	public getCoupon(id: string): Observable<Coupon> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.get<Coupon>(this.adminBase + 'coupon/' + id, { headers }).pipe(map(coupon => {
				coupon.created = new Date(coupon.created!);
				coupon.modified = new Date(coupon.modified!);
				return coupon;
			}));
		} else {
			return new Observable<Coupon>();
		}
	}

	public getCouponCount(): Observable<number> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.get<number>(this.adminBase + 'coupons/count', { headers });
		} else {
			return new Observable<number>();
		}
	}

	public submitCoupon(coupon: Coupon): Observable<Coupon> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.post<Coupon>(this.adminBase + 'coupons', coupon, { headers });
		} else {
			return new Observable<Coupon>();
		}
	}

	public editCoupon(coupon: Coupon): Observable<string> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.put<string>(this.adminBase + 'coupon/' + coupon.id, coupon, { headers });
		} else {
			return new Observable<string>();
		}
	}

	public deleteCoupon(id: string): Observable<string> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.delete<string>(this.adminBase + 'coupon/' + id, { headers });
		} else {
			return new Observable<string>();
		}
	}

	public checkCouponSlugTaken(slug: string): Observable<string> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken).append('Accept', 'application/json');
			const params = new HttpParams().append('slug', slug)
			return this.http.get<string>(this.adminBase + 'coupons/slugTaken', { headers, params });
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

}
