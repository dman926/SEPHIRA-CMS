import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { Observable } from 'rxjs';
import { Media } from 'src/app/models/media';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root'
})
export class FileService {

	readonly fileBase = environment.apiServer + 'file/';

	constructor(private http: HttpClient, private cookie: CookieService) { }

	public upload(file: File, isThumbnail?: boolean): Observable<HttpEvent<string>> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			const body = new FormData();
			body.append('file', file);
			body.append('isThumbnail', isThumbnail ? isThumbnail.toString() : false.toString());
			return this.http.post<string>(this.fileBase + 'uploader', body, { headers, reportProgress: true, observe: 'events' });
		} else {
			return new Observable<HttpEvent<string>>();
		}
	}

	public getMedia(): Observable<Media[]> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.get<Media[]>(this.fileBase + 'media', { headers });
		} else {
			return new Observable<Media[]>();
		}
	}

	public deleteFile(filename: string): Observable<string> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.delete<string>(this.fileBase + 'media/' + filename, { headers });
		} else {
			return new Observable<string>();
		}
	}

}
