import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

interface TokenPair {
	accessToken: string;
	refreshToken: string;
}

@Injectable({
	providedIn: 'root'
})
export class AuthService {

	private readonly authBase = environment.apiBase + 'auth/';

	constructor(private http: HttpClient) { }

	public login(email: string, password: string): Observable<TokenPair> {
		const body = {
			email,
			password
		};
		return this.http.post<TokenPair>(this.authBase + 'login', body);
	}

	public signup(email: string, password: string) {
		const body = {
			email,
			password
		};
		return this.http.post(this.authBase + 'signup', body);
	}

	public refresh(): Observable<TokenPair> {
		const refresh = localStorage.getItem('refreshToken');
		if (refresh) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + refresh);
			return this.http.get<TokenPair>(this.authBase + 'refresh', {headers});
		} else {
			return new Observable<TokenPair>();
		}
	}

	public checkPassword(password: string) {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken).append('Accept', 'application/json');
			return this.http.post<any>(this.authBase + 'checkPassword', {password}, {headers});
		} else {
			return new Observable<any>();
		}
	}

	public setTokens(accessToken: string, refreshToken?: string) {
		localStorage.setItem('accessToken', accessToken);
		const date = new Date();
		date.setDate(date.getDate() + 7);
		localStorage.setItem('tokenExpires', date.toString());
		if (refreshToken) {
			localStorage.setItem('refreshToken', refreshToken);
		}
	}

}
