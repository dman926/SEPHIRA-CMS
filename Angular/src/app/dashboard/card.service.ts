import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Card } from '../models/card';

interface Id {
	id: string;
}

@Injectable({
	providedIn: 'root'
})
export class CardService {

	private readonly cardBase = environment.apiServer + 'card/';

	constructor(private http: HttpClient) { }

	public getCards(): Observable<Card[]> {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken).append('Accept', 'application/json');
			return this.http.get<Card[]>(this.cardBase + 'cards', { headers });
		} else {
			return new Observable<Card[]>();
		}
	}

	public addCard(card: Card): Observable<Id> {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken).append('Accept', 'application/json');
			return this.http.post<Id>(this.cardBase + 'cards', card, { headers });
		} else {
			return new Observable<Id>();
		}

	}

	public editCard(id: string, card: Card): Observable<string> {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken).append('Accept', 'application/json');
			return this.http.put<string>(this.cardBase + 'card/' + id, card, { headers });
		} else {
			return new Observable<string>();
		}

	}

	public deleteCard(id?: string): Observable<string> {
		const accessToken = localStorage.getItem('accessToken');
		if (accessToken && id) {
			const headers = new HttpHeaders().append('Authorization', 'Bearer ' + accessToken).append('Accept', 'application/json');
			return this.http.delete<string>(this.cardBase + 'card/' + id, { headers });
		} else {
			return new Observable<string>();
		}
	}
}