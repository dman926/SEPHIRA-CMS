import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root'
})
export class FileService {

	readonly fileBase = environment.apiServer + 'file/';

	constructor(private http: HttpClient) { }

	public upload(file: File): Observable<HttpEvent<string>> {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			const body = new FormData();
			body.append('file', file);
			return this.http.post<string>(this.fileBase + 'uploader', body, { headers, reportProgress: true, observe: 'events' });
		} else {
			return new Observable<HttpEvent<string>>();
		}
	}

	public getMedia(): Observable<string[]> {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.get<string[]>(this.fileBase + 'media', { headers });
		} else {
			return new Observable<string[]>();
		}
	}

	public deleteFile(filename: string): Observable<string> {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken);
			return this.http.delete<string>(this.fileBase + 'media/' + filename, { headers });
		} else {
			return new Observable<string>();
		}
	}

}
