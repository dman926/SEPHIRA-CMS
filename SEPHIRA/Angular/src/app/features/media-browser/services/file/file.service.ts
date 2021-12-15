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

	public upload(file: File, folder: string, ratio?: string): Observable<HttpEvent<string>> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			const body = new FormData();
			body.append('file', file);
			body.append('folder', folder);
			if (ratio) {
				body.append('ratio', ratio);
			}
			return this.http.post<string>(this.fileBase + 'uploader', body, { headers, reportProgress: true, observe: 'events' });
		} else {
			return EMPTY;
		}
	}

	public getMedia(page?: number, size?: number): Observable<AllMedia> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			let params = new HttpParams();
			if (page && size) {
				params = params.append('page', page).append('size', size);
			}
			return this.http.get<AllMedia>(this.fileBase + 'media', { headers, params });
		} else {
			return EMPTY;
		}
	}

	public deleteFile(filename: string): Observable<string> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			return this.http.delete<string>(this.fileBase + 'media/' + filename, { headers });
		} else {
			return EMPTY;
		}
	}

}
