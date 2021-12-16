import { HttpClient, HttpEvent, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { CoreService } from 'src/app/core/services/core/core.service';
import { Media } from 'src/app/models/media';
import { environment } from 'src/environments/environment';

interface AllMedia {
	count: number;
	files: Media[];
}

@Injectable({
	providedIn: 'root',
})
export class FileService {

	private readonly fileBase = environment.apiServer + 'file/';

	constructor(private http: HttpClient, private core: CoreService) { }

	public upload(file: File, folder: string, ratio?: string): Observable<HttpEvent<Media>> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			const body = new FormData();
			body.append('file', file);
			body.append('folder', folder);
			if (ratio) {
				body.append('ratio', ratio);
			}
			return this.http.post<Media>(this.fileBase + 'upload', body, { headers, reportProgress: true, observe: 'events' });
		} else {
			return EMPTY;
		}
	}

	public createFolder(folder: string): Observable<boolean> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			return this.http.post<boolean>(this.fileBase + 'folder', { folder }, { headers });
		} else {
			return EMPTY;
		}
	}

	public getMedia(folder: string): Observable<Media[]> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			const params = new HttpParams().append('folder', folder);
			return this.http.get<Media[]>(this.fileBase + 'media', { headers, params });
		} else {
			return EMPTY;
		}
	}

	public deleteFile(path: string): Observable<string> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			const params = new HttpParams().append('path', path);
			return this.http.delete<string>(this.fileBase + 'media', { headers, params });
		} else {
			return EMPTY;
		}
	}

}
