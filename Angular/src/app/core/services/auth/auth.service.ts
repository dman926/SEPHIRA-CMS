import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { User } from 'src/app/models/user';
import { environment } from 'src/environments/environment';
import { CookieService } from '../cookie/cookie.service';
import { CoreService } from '../core/core.service';
import { PlatformService } from '../platform/platform.service';

interface TokenPair {
	accessToken: string;
	refreshToken: string;
}

interface Id {
	id: string;
}

@Injectable({
	providedIn: 'root',
})
export class AuthService {

	public user$: Observable<User | null>;

	private userSubject: BehaviorSubject<User | null>;

	private readonly authBase = environment.apiServer + 'auth/';
	private readonly userStateKey = makeStateKey<User | null>('user');
		
	constructor(private http: HttpClient, private core: CoreService, private platform: PlatformService, private cookie: CookieService, private state: TransferState, private router: Router) {
		this.userSubject = new BehaviorSubject<User | null>(null);
		this.user$ = this.userSubject.asObservable();
		if (this.platform.isServer) {
			this.refreshTokensAndUser();
		} else {
			this.setUser(this.state.get(this.userStateKey, null));
			setInterval(this.refreshTokensAndUser, 1000 * 60 * 5); // Refresh the tokens and user every 5 minutes
		}
	}

	public logout(redirect?: boolean): void {
		this.setUser(null);
		this.cookie.removeItem('accessToken');
		this.cookie.removeItem('refreshToken');
		if (redirect) {
			this.router.navigate(['/'], { state: { signedOut: true } });
		}
	}

	public login(email: string, password: string, otp?: string): Observable<TokenPair> {
		return this.http.post<TokenPair>(this.authBase + 'login', { email, password, otp });
	}

	public signup(email: string, password: string): Observable<Id> {
		return this.http.post<Id>(this.authBase + 'signup', { email, password });
	}

	public setTokens(accessToken: string, refreshToken?: string): void {
		this.cookie.setItem('accessToken', accessToken, new Date(Date.now() + (1000 * 60 * 60 * 24 * 1)), 'strict'); // Expires in 1 day
		if (refreshToken) {
			this.cookie.setItem('refreshToken', refreshToken, new Date(Date.now() + (1000 * 60 * 60 * 24 * 30)), 'strict'); // Expires in 30 days
		}
	}

	public setUser(user: User | null): void {
		this.userSubject.next(user);
		this.state.set<User | null>(this.userStateKey, user);
	}

	public refresh(): Observable<TokenPair> {
		const refresh = this.cookie.getItem('refreshToken');
		if (refresh) {
			const headers = new HttpHeaders().append('Authorization', `Bearer ${refresh}`);
			return this.http.post<TokenPair>(this.authBase + 'refresh', { headers });
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

	public CheckOtp(otp: string): Observable<boolean> {
		const headers = this.core.createAuthHeader();
		if (headers) {
			return this.http.post<boolean>(this.authBase + '2fa', otp, { headers });
		} else {
			return EMPTY;
		}
	}

	private refreshTokensAndUser(): void {
		this.refresh().subscribe({
			next: tokens => {
				this.setTokens(tokens.accessToken, tokens.refreshToken);
				this.getUser().subscribe({
					next: user => this.setUser(user),
					error: err => this.logout()
				});
			},
			error: err => this.logout(true)
		});
	}

}
