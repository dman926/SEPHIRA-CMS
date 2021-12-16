import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { debounceTime, EMPTY, map, Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CookieService } from '../cookie/cookie.service';

@Injectable({
	providedIn: 'root',
})
export class CoreService {

	/** A regex for validating a URL slug */
	public slugRegex: string = '^([/]?)+([a-z0-9]?)+(?:-[a-z0-9]+)*$';

	constructor(private cookie: CookieService, private http: HttpClient) {}

	/**
	 * Create an Authorization header to be used with the SEPHIRA backend
	 * @returns Either a `HttpHeaders` with Authorization if the access token cookie is available. `null` otherwise.
	 */
	public createAuthHeader(): HttpHeaders | null {
		const accessToken = this.cookie.getItem('accessToken');
		if (accessToken) {
			return new HttpHeaders().append(
				'Authorization',
				`Bearer ${accessToken}`
			);
		}
		return null;
	}

	/**
	 * A ReactiveForms Validator to check if the post slug is taken
	 * @param postType The post type. ex. `models.Page`
	 * @returns An observable containing errors if any
	 */
	public slugValidator(postType: string, postID?: string): AsyncValidatorFn {
		if (!postType) {
			// Slug technically OK because it's not associated with a post type
			return () => EMPTY;
		}
		return (control: AbstractControl): Observable<ValidationErrors | null> => {
			if (control.hasError('pattern')) {
				return EMPTY;
			} else {
				// Have to hardcode this to avoid circular dependency.
				// Would rather be able to use CoreService in PostService than the other way around.
				const params = new HttpParams().append('post', postType).append('slug', control.value);
				return this.http.get<boolean | string>(environment.apiServer + 'post/posts/slugTaken', { params }).pipe(
					debounceTime(500),
					take(1),
					map(res => {
						if (postID) {
							return res !== postID ? { slugTaken: true } : null;
						} else {
							return res ? { slugTaken: true } : null
						}
					})
				);	
			}
		};
	}

	/**
	 * Format bytes to the highest posible order (ex. 1024 => 1 KB)
	 * @param bytes The number of bytes to format
	 * @param decimals The decimal precision
	 * @returns A string formatted to the highest possible order
	 */
	formatBytes(bytes: number, decimals: number = 2): string {
		if (bytes === 0) return '0 Bytes';
	
		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	
		const i = Math.floor(Math.log(bytes) / Math.log(k));
	
		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
	}

}
