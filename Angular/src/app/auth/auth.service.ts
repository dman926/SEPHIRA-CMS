import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';

interface TokenPair {
	accessToken: string;
	refreshToken: string;
}

interface Id {
	id: string;
}

@Injectable({
	providedIn: 'root'
})
export class AuthService {

	public user$: Observable<User | null>;

	private readonly authBase = environment.apiServer + 'auth/';

	private userSubject: BehaviorSubject<User | null>;

	constructor(private http: HttpClient) {
		this.userSubject = new BehaviorSubject<User | null>(null);
		this.user$ = this.userSubject.asObservable();
		this.refresh().toPromise().then(tokens => {
			this.setTokens(tokens.accessToken);
			this.getUser().toPromise().then(res => {
				this.setUser(res);
			}).catch(err => {
				this.setUser(null);
				localStorage.removeItem('accessToken');
				console.error('Error fetching user (token expiration error): ' + err);
			});
			setInterval(() =>
				this.getUser().toPromise().then(user => this.setUser(user)), 1000 * 60 * 5); // Get the current user again every 5 minutes
		});
	}

	public login(email: string, password: string): Observable<TokenPair> {
		const body = {
			email,
			password
		};
		return this.http.post<TokenPair>(this.authBase + 'login', body);
	}

	public signup(email: string, password: string): Observable<Id> {
		const body = {
			email,
			password
		};
		return this.http.post<Id>(this.authBase + 'signup', body);
	}

	public refresh(): Observable<TokenPair> {
		const refresh = localStorage.getItem('refreshToken');
		if (refresh) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + refresh);
			return this.http.get<TokenPair>(this.authBase + 'refresh', { headers });
		} else {
			return new Observable<TokenPair>();
		}
	}

	public checkPassword(password: string): any {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken).append('Accept', 'application/json');
			return this.http.post<any>(this.authBase + 'checkPassword', { password }, { headers });
		} else {
			return new Observable<any>();
		}
	}

	public setTokens(accessToken: string, refreshToken?: string): void {
		localStorage.setItem('accessToken', accessToken);
		const date = new Date();
		date.setDate(date.getDate() + 7);
		localStorage.setItem('tokenExpires', date.toString());
		if (refreshToken) {
			localStorage.setItem('refreshToken', refreshToken);
		}
	}



	public getUser(): Observable<User> {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken).append('Accept', 'application/json');
			return this.http.get<User>(this.authBase + 'user', { headers });
		} else {
			return new Observable<User>();
		}
	}

	public updateUser(user: User): Observable<string> {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken).append('Accept', 'application/json');
			return this.http.put<string>(this.authBase + 'user', user, { headers });
		} else {
			return new Observable<string>();
		}
	}

	public deleteUser(): Observable<string> {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken).append('Accept', 'application/json');
			return this.http.delete<string>(this.authBase + 'user', { headers });
		} else {
			return new Observable<string>();
		}
	}

	public setUser(user: User | null): void {
		this.userSubject.next(user);
	}

}
