import { HttpClient, HttpEvent, HttpParams } from '@angular/common/http';
import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { EMPTY, Observable } from 'rxjs';
import { CoreService } from 'src/app/core/services/core/core.service';
import { Media } from 'src/app/models/media';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root',
})
export class FileService {

	private readonly fileBase = environment.apiServer + 'file/';

	constructor(private http: HttpClient, private core: CoreService, private sanitizer: DomSanitizer) { }

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

	public getMedia(folder?: string, ids?: string[], sort?: string): Observable<Media[]> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			let params = new HttpParams()
			if (folder) {
				params = params.append('folder', folder);
			} else if (ids) {
				params = params.append('ids', ids.toString());
			}
			if (sort) {
				params = params.append('sort', sort);
			}
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

	public getStreamUrl(folder?: string, filename?: string, id?: string): string {
		if (id) {
			return this.fileBase + 'stream?id='  + encodeURIComponent(id);
		} else if (folder !== undefined && filename) {
			return this.fileBase + 'stream?folder=' + encodeURIComponent(folder) + '&filename=' + encodeURIComponent(filename);
		}
		return '';
	}

	loadFileFromBlob(blob: Blob): Promise<SafeUrl> {
		const reader = new FileReader();
		return new Promise((resolve, reject) => {
			reader.onload = () => {
				resolve(this.sanitizer.bypassSecurityTrustUrl(reader.result as string));
			}
			reader.readAsDataURL(blob);
		});
	}

}
