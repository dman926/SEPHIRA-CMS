import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Post } from '../models/post';

@Injectable({
	providedIn: 'root'
})
export class PostService {

	private readonly postBase = environment.apiServer + 'post/'

	constructor(private http: HttpClient) { }

	public getPost(slug: string): Observable<Post> {
		const params = new HttpParams().append('slug', slug);
		return this.http.get<Post>(this.postBase + 'post', { params });
	}

}
