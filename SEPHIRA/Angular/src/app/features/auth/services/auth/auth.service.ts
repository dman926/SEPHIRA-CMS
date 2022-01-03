import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { User } from 'src/app/models/user';
import { environment } from 'src/environments/environment';
import { CookieService } from '../../../../core/services/cookie/cookie.service';
import { CoreService } from '../../../../core/services/core/core.service';
import { PlatformService } from '../../../../core/services/platform/platform.service';

interface TokenPair {
	access_token: string;
	refresh_token: string;
}

interface Id {
	id: string;
}

@Injectable({
	providedIn: 'root',
})
export class AuthService {

	/**
	 * Observable that stores the user
	 */
	public user$: Observable<User | null>;

	/**
	 * A simple observable that will toggle `true` then `false` when the user is force logged out due to invalid tokens to allow components to notify the user why they were logged out and redirected
	 */
	public forceLogout$: Observable<boolean>;

	private userSubject: BehaviorSubject<User | null>;
	private forceLogoutSubject: BehaviorSubject<boolean>;

	private readonly authBase = environment.apiServer + 'auth/';
	private readonly userStateKey = makeStateKey<User | null>('user');
		
	constructor(private http: HttpClient, private core: CoreService, private platform: PlatformService, private cookie: CookieService, private state: TransferState, private router: Router) {
		this.userSubject = new BehaviorSubject<User | null>(null);
		this.user$ = this.userSubject.asObservable();

		this.forceLogoutSubject = new BehaviorSubject<boolean>(false);
		this.forceLogout$ = this.forceLogoutSubject.asObservable();
		
		if (this.platform.isServer) {
			this.refreshTokensAndUser();
		} else {
			this.setUser(this.state.get(this.userStateKey, null));
			setInterval(() => {
				this.refreshTokensAndUser();
			}, 1000 * 60 * 5); // Refresh the tokens and user every 5 minutes
		}
	}

	public logout(redirect?: boolean): void {
		this.setUser(null);
		this.cookie.removeItem('accessToken');
		this.cookie.removeItem('refreshToken');
		if (redirect) {
			this.router.navigate(['/']);
		}
		this.forceLogoutSubject.next(true);
		this.forceLogoutSubject.next(false);
	}

	public login(username: string, password: string, otp?: string): Observable<TokenPair> {
		return this.http.post<TokenPair>(this.authBase + 'login', { username, password, client_id: otp });
	}

	public signup(username: string, password: string): Observable<Id> {
		return this.http.post<Id>(this.authBase + 'signup', { username, password });
	}

	public verify(token: string): Observable<string> {
		if (!this.isSignedIn) {
			const headers = new HttpHeaders().append('Authorization', `Bearer ${token}`);
			return this.http.post<string>(this.authBase + 'verify', {}, { headers });
		} else {
			return EMPTY;
		}
	}

	public resendVerify(email: string): Observable<string> {
		if (!this.isSignedIn) {
			return this.http.post<string>(this.authBase + 'resend-verify', { email });
		} else {
			return EMPTY;
		}
	}

	public setTokens(accessToken: string, refreshToken?: string): void {
		this.cookie.setItem('accessToken', accessToken, new Date(Date.now() + (1000 * 60 * 60 * 24 * 1)), 'strict'); // Expires in 1 day
		if (refreshToken) {
			this.cookie.setItem('refreshToken', refreshToken, new Date(Date.now() + (1000 * 60 * 60 * 24 * 30)), 'strict'); // Expires in 30 days
		}
	}

	public setUser(user: User | null): void {
		this.userSubject.next(user);
		if (this.platform.isBrowser && user) {
			localStorage.setItem('cart', JSON.stringify(user.cart));
		}
		this.state.set(this.userStateKey, user);
	}

	public refresh(): Observable<TokenPair> {
		const refresh = this.cookie.getItem('refreshToken');
		if (refresh) {
			const headers = new HttpHeaders().append('Authorization', `Bearer ${refresh}`);
			return this.http.post<TokenPair>(this.authBase + 'refresh', {}, { headers });
		} else {
			return EMPTY;
		}
	}

	public getUser(): Observable<User> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			return this.http.get<User>(this.authBase + 'user', { headers });
		} else {
			return EMPTY;
		}
	}

	public updateUser(user: User): Observable<boolean> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			return this.http.put<boolean>(this.authBase + 'user', user, { headers });
		} else {
			return EMPTY;
		}
	}

	public deleteUser(): Observable<boolean> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			return this.http.delete<boolean>(this.authBase + 'user', { headers });
		} else {
			return EMPTY;
		}
	}

	public getOtpUri(): Observable<string> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			return this.http.get<string>(this.authBase + '2fa', { headers });
		} else {
			return EMPTY;
		}
	}

	public checkOtp(otp: string): Observable<boolean> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			return this.http.post<boolean>(this.authBase + '2fa', { otp }, { headers });
		} else {
			return EMPTY;
		}
	}

	public forgotPassword(email: string): Observable<string> {
		if (!this.isSignedIn) {
			return this.http.post<string>(this.authBase + 'forgot', { email });
		} else {
			return EMPTY;
		}
	}

	public resetPassword(password: string, token: string): Observable<TokenPair | string> {
		if (!this.isSignedIn) {
			const headers = new HttpHeaders().append('Authorization', `Bearer ${token}`);
			return this.http.post<string>(this.authBase + 'reset', { password }, { headers });
		} else {
			return EMPTY;
		}
	}

	get isSignedIn(): boolean {
		return this.cookie.getItem('accessToken') !== null;
	}

	private refreshTokensAndUser(): void {
		if (this.cookie.getItem('accessToken') === 'undefined' || this.cookie.getItem('refreshToken') === 'undefined') {
			this.cookie.removeItem('accessToken');
			this.cookie.removeItem('refreshToken');
		}
		this.refresh().subscribe({
			next: tokens => {
				this.setTokens(tokens.access_token, tokens.refresh_token);
				this.getUser().subscribe({
					next: user => this.setUser(user),
					error: err => {
						this.logout(true);
					}
				});
			},
			error: err => this.logout(true)
		});
	}

}
