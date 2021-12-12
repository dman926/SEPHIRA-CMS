import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CoreService } from 'src/app/core/services/core/core.service';
import { Review } from 'src/app/models/review';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root',
})
export class ProductService {

	private readonly productBase = environment.apiServer + 'product/';

	constructor(private http: HttpClient, private core: CoreService) { }

	public getReviews(id: string, page?: number, size?: number): Observable<Review[]> {
		let params = new HttpParams();
		if (page && size) {
			params = params.append('page', page.toString()).append('size', size.toString())
		}
		return this.http.get<Review[]>(this.productBase + 'product/' + id + '/reviews', { params });
	}

	public submitReview(review: Review): Observable<Review> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			return this.http.post<Review>(this.productBase + 'product/' + review.product + '/reviews', review, { headers });
		} else {
			return new Observable<Review>();
		}
	}

	public reviewAllowed(id: string): Observable<boolean> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			return this.http.get<boolean>(this.productBase + 'product/' + id + '/reviewAllowed', { headers });
		} else {
			return new Observable<boolean>();
		}
	}

	public getReviewCount(id: string): Observable<number> {
		return this.http.get<number>(this.productBase + 'product/' + id + '/reviews/count');
	}

}
