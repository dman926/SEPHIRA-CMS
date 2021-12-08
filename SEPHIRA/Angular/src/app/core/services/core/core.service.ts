import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from '../cookie/cookie.service';

@Injectable({
	providedIn: 'root',
})
export class CoreService {
	constructor(private cookie: CookieService) {}

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
}
