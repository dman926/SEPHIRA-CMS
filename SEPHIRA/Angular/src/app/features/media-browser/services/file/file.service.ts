import { HttpClient, HttpEvent, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { CoreService } from 'src/app/core/services/core/core.service';
import { Media } from 'src/app/models/media';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root',
})
export class FileService {

	private readonly fileBase = environment.apiServer + 'file/';

	constructor(private http: HttpClient, private core: CoreService) { }

	public upload(file: File, folder: string, childOf?: string[]): Observable<HttpEvent<Media>> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			const body = new FormData();
			body.append('file', file);
			body.append('folder', folder);
			if (childOf) {
				body.append('childOf', childOf.toString());
			}
			return this.http.post<Media>(this.fileBase + 'upload', body, { headers, reportProgress: true, observe: 'events' });
		} else {
			return EMPTY;
		}
	}

	public createFolder(folder: string): Observable<Media> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			return this.http.post<Media>(this.fileBase + 'folder', { folder }, { headers });
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

	public deleteMedia(folder: string, filename?: string): Observable<string> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			let params = new HttpParams().append('folder', folder);
			if (filename) {
				params = params.append('filename', filename);
			}
			return this.http.delete<string>(this.fileBase + 'media', { headers, params });
		} else {
			return EMPTY;
		}
	}

	public getStream(folder: string, filename: string): Observable<Blob> {
		const params = new HttpParams().append('folder', folder).append('filename', filename);
		return this.http.get(this.fileBase + 'stream', { params, responseType: 'blob' });
	}

	public getStreamUrl(folder: string, filename: string): string {
		return this.fileBase + 'stream?folder=' + encodeURIComponent(folder) + '&filename=' + encodeURIComponent(filename);
	}

}
