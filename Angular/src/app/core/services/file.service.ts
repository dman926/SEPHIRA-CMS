import { HttpClient, HttpEvent, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { Observable } from 'rxjs';
import { Media } from 'src/app/models/media';
import { environment } from 'src/environments/environment';

interface AllMedia {
	count: number;
	files: Media[];
}

@Injectable({
	providedIn: 'root'
})
export class FileService {

	readonly fileBase = environment.apiServer + 'file/';

	constructor(private http: HttpClient, private cookie: CookieService) { }

	public upload(file: File, isThumbnail?: boolean): Observable<HttpEvent<string>> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			const body = new FormData();
			body.append('file', file);
			body.append('isThumbnail', isThumbnail ? isThumbnail.toString() : false.toString());
			return this.http.post<string>(this.fileBase + 'uploader', body, { headers, reportProgress: true, observe: 'events' });
		} else {
			return new Observable<HttpEvent<string>>();
		}
	}

	public getMedia(page?: number, size?: number): Observable<AllMedia> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			let params = new HttpParams();
			if (page && size) {
				params = params.append('page', page).append('size', size);
			}
			return this.http.get<AllMedia>(this.fileBase + 'media', { headers, params });
		} else {
			return new Observable<AllMedia>();
		}
	}

	public deleteFile(filename: string): Observable<string> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken && accessToken !== 'undefined') {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.delete<string>(this.fileBase + 'media/' + filename, { headers });
		} else {
			return new Observable<string>();
		}
	}

}
