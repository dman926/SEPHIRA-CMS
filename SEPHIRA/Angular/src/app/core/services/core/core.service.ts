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
	public slugValidator(postType: string): AsyncValidatorFn {
		if (!postType) {
			// Slug technically OK because it's not associated with a post type
			return () => EMPTY;
		}
		return (control: AbstractControl): Observable<ValidationErrors | null> => {
			if (control.hasError('pattern')) {
				return EMPTY;
			} else {
				// TODO: switch this with a post service instead to make every request in one place
				const params = new HttpParams().append('post', postType).append('slug', control.value);
				return this.http.get<boolean>(environment.apiServer + 'post/posts/slugTaken', { params }).pipe(
					debounceTime(500),
					take(1),
					map(res => !res ? { slugTaken: true } : null)
				);	
			}
		};
	}

}
