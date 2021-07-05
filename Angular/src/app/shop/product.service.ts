import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Product } from '../models/product';

@Injectable({
	providedIn: 'root'
})
export class ProductService {

	private readonly productBase = environment.apiServer + 'product/'

	constructor(private http: HttpClient, private sanitizer: DomSanitizer) { }

	public getAllProducts(page?: number, size?: number): Observable<Product[]> {
		let params = new HttpParams();
		if (page && size) {
			params = params.append('page', page.toString()).append('size', size.toString())
		}
		return this.http.get<Product[]>(this.productBase + 'products', { params }).pipe(map(products => {
			return products.map(product => {
				product.content = this.sanitizer.bypassSecurityTrustHtml(product.content as string);
				product.created = new Date(product.created!);
				product.modified = new Date(product.modified!);
				return product;
			});
		}));
	}

	public getProduct(slug: string): Observable<Product> {
		const params = new HttpParams().append('slug', slug);
		return this.http.get<Product>(this.productBase + 'product', { params }).pipe(map(product => {
			product.content = this.sanitizer.bypassSecurityTrustHtml(product.content as string);
			product.created = new Date(product.created!);
			product.modified = new Date(product.modified!);
			return product;
		}));
	}

	public getProductCount(status?: string[]): Observable<number> {
		if (!status) {
			status = ['publish', 'draft'];
		}
		const params = new HttpParams().append('status', status.toString());
		return this.http.get<number>(this.productBase + 'products/count', { params });
	}

}
