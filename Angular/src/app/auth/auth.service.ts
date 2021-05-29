import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { WebsocketService } from '../core/services/websocket.service';
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

	private userSubject: BehaviorSubject<User | null>;

	private readonly authBase = environment.apiServer + 'auth/';

	constructor(private http: HttpClient, private ws: WebsocketService) {
		this.userSubject = new BehaviorSubject<User | null>(null);
		this.user$ = this.userSubject.asObservable();
		const cachedUser = localStorage.getItem('user');
		if (cachedUser) {
			this.setUser(JSON.parse(cachedUser));
		}
		this.refresh().toPromise().then(tokens => {
			this.setTokens(false, tokens.accessToken, tokens.refreshToken);
			this.getUser().toPromise().then(res => {
				this.setUser(res);
			}).catch(err => {
				this.setUser(null);
				localStorage.removeItem('accessToken');
				localStorage.removeItem('refreshToken');
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

	public setTokens(refreshSocket: boolean, accessToken: string, refreshToken?: string): void {
		localStorage.setItem('accessToken', accessToken);
		if (refreshToken) {
			localStorage.setItem('refreshToken', refreshToken);
		}
		if (refreshSocket) {
			this.ws.killSocket();
			const socket = io(environment.socketServer, {
				extraHeaders: {
					Authorization: 'Bearer ' + localStorage.getItem('accessToken')
				}
			});
			this.ws.setSocket(socket);
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
		if (user) {
			localStorage.setItem('user', JSON.stringify(user));
		} else {
			localStorage.removeItem('user');
		}
	}

	public getOtpQr(): Observable<string> {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken).append('Accept', 'application/json');
			return this.http.get<string>(this.authBase + '2fa', { headers });
		} else {
			return new Observable<string>();
		}
	}

	public CheckOtp(otp: string): Observable<string> {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken).append('Accept', 'application/json');
			return this.http.post<string>(this.authBase + '2fa', { otp }, { headers });
		} else {
			return new Observable<string>();
		}
	}

}
