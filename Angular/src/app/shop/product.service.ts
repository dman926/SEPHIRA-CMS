import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CookieService } from 'ngx-cookie';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Product } from '../models/product';
import { Review } from '../models/review';

interface AllProducts {
	total: number;
	products: Product[];
}

@Injectable({
	providedIn: 'root'
})
export class ProductService {

	private readonly productBase = environment.apiServer + 'product/'

	constructor(private http: HttpClient, private sanitizer: DomSanitizer, private cookie: CookieService) { }

	public getAllProducts(page?: number, size?: number, search?: string): Observable<AllProducts> {
		let params = new HttpParams();
		if (page && size) {
			params = params.append('page', page.toString()).append('size', size.toString())
		}
		if (search) {
			params = params.append('search', search);
		}
		return this.http.get<AllProducts>(this.productBase + 'products', { params }).pipe(map(res => {
			res.products = res.products.map(product => {
				if (product.content) {
					product.content = this.sanitizer.bypassSecurityTrustHtml(product.content as string);
				}
				product.created = new Date(product.created!);
				product.modified = new Date(product.modified!);
				return product;
			});
			return res;
		}));
	}

	public getProduct(slug: string): Observable<Product> {
		const params = new HttpParams().append('slug', slug);
		return this.http.get<Product>(this.productBase + 'product', { params }).pipe(map(product => {
			// Can't put the DOM Sanitization here due to SSR bug not transfering SafeHTML correctly
			product.created = new Date(product.created!);
			product.modified = new Date(product.modified!);
			return product;
		}));
	}

	public getProductCount(): Observable<number> {
		return this.http.get<number>(this.productBase + 'products/count');
	}

	public getReviews(id: string, page?: number, size?: number): Observable<Review[]> {
		let params = new HttpParams();
		if (page && size) {
			params = params.append('page', page.toString()).append('size', size.toString())
		}
		return this.http.get<Review[]>(this.productBase + 'product/' + id + '/reviews', { params });
	}

	public submitReview(review: Review): Observable<Review> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.post<Review>(this.productBase + 'product/' + review.product + '/reviews', review, { headers });
		} else {
			return new Observable<Review>();
		}
	}

	public reviewAllowed(id: string): Observable<boolean> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.get<boolean>(this.productBase + 'product/' + id + '/reviewAllowed', { headers });
		} else {
			return new Observable<boolean>();
		}
	}

	public getReviewCount(id: string): Observable<number> {
		return this.http.get<number>(this.productBase + 'product/' + id + '/reviews/count');
	}


}
