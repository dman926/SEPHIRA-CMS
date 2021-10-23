import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Review } from '../models/review';

@Injectable({
	providedIn: 'root'
})
export class ProductService {

	private readonly productBase = environment.apiServer + 'product/'

	constructor(private http: HttpClient, private cookie: CookieService) { }

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
