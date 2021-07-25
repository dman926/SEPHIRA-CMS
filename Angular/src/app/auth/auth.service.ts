import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { BehaviorSubject, Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { PlatformService } from '../core/services/platform.service';
import { WebsocketService } from '../core/services/websocket.service';
import { User } from '../models/user';

interface TokenPair {
	accessToken: string;
	refreshToken: string;
}

interface Id {
	id: string;
}

interface Login {
	email: string;
	password: string;
	otp?: string;
}

@Injectable({
	providedIn: 'root'
})
export class AuthService {

	public user$: Observable<User | null>;

	private userSubject: BehaviorSubject<User | null>;

	private readonly authBase = environment.apiServer + 'auth/';

	constructor(private http: HttpClient, private ws: WebsocketService, private platformService: PlatformService, private cookie: CookieService) {
		this.userSubject = new BehaviorSubject<User | null>(null);
		this.user$ = this.userSubject.asObservable();
		if (this.platformService.isBrowser()) {
			const cachedUser = localStorage.getItem('user');
			if (cachedUser) {
				this.setUser(JSON.parse(cachedUser));
			}
		}
		this.refresh().toPromise().then(tokens => {
			this.setTokens(false, tokens.accessToken, tokens.refreshToken);
			if (this.platformService.isBrowser()) {
				this.getUser().toPromise().then(res => {
					this.setUser(res);
				}).catch(err => {
					this.setUser(null);
					this.cookie.remove('accessToken');
					this.cookie.remove('refreshToken');
					console.error('Error fetching user (token expiration error): ' + err);
				});
				setInterval(() =>
					this.getUser().toPromise().then(user => this.setUser(user)), 1000 * 60 * 5); // Get the current user again every 5 minutes
			}
		});
	}

	public login(email: string, password: string, otp?: string): Observable<TokenPair> {
		const body: Login = {
			email,
			password
		};
		if (otp) {
			body.otp = otp;
		}
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
		const refresh = this.cookie.get('refreshToken');
		if (refresh) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + refresh);
			return this.http.get<TokenPair>(this.authBase + 'refresh', { headers });
		} else {
			return new Observable<TokenPair>();
		}
	}

	public checkPassword(password: string): any {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken).append('Accept', 'application/json');
			return this.http.post<any>(this.authBase + 'checkPassword', { password }, { headers });
		} else {
			return new Observable<any>();
		}
	}

	public setTokens(refreshSocket: boolean, accessToken: string, refreshToken?: string): void {
		this.cookie.put('accessToken', accessToken, { expires: new Date(Date.now() + (1000 * 60 * 60 * 24 * 1)) }); // expires in 1 day
		if (refreshToken) {
			this.cookie.put('refreshToken', refreshToken, { expires: new Date(Date.now() + (1000 * 60 * 60 * 24 * 30)) }); // expires in 30 days
		}
		if (refreshSocket) {
			this.ws.killSocket();
			const socket = io(environment.socketServer, {
				extraHeaders: {
					Authorization: 'Bearer ' + accessToken
				}
			});
			this.ws.setSocket(socket);
		}
	}

	public getUser(): Observable<User> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken).append('Accept', 'application/json');
			return this.http.get<User>(this.authBase + 'user', { headers });
		} else {
			return new Observable<User>();
		}
	}

	public updateUser(user: User): Observable<string> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken).append('Accept', 'application/json');
			return this.http.put<string>(this.authBase + 'user', user, { headers });
		} else {
			return new Observable<string>();
		}
	}

	public deleteUser(): Observable<string> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken).append('Accept', 'application/json');
			return this.http.delete<string>(this.authBase + 'user', { headers });
		} else {
			return new Observable<string>();
		}
	}

	public setUser(user: User | null): void {
		this.userSubject.next(user);
		if (user) {
			localStorage.setItem('user', JSON.stringify(user));
		} else {
			localStorage.removeItem('user');
		}
	}

	public getOtpQr(): Observable<string> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken).append('Accept', 'application/json');
			return this.http.get<string>(this.authBase + '2fa', { headers });
		} else {
			return new Observable<string>();
		}
	}

	public CheckOtp(otp: string): Observable<string> {
		const accessToken = this.cookie.get('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken).append('Accept', 'application/json');
			return this.http.post<string>(this.authBase + '2fa', { otp }, { headers });
		} else {
			return new Observable<string>();
		}
	}

}
