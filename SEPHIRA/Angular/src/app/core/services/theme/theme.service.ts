import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CookieService } from '../cookie/cookie.service';

@Injectable({
	providedIn: 'root',
})
export class ThemeService {

	theme$: Observable<'light' | 'dark'>;
	private themeSubject: BehaviorSubject<'light' | 'dark'>;

	constructor(private cookie: CookieService) {
		let startTheme: 'light' | 'dark' = environment.defaultLightDark === 'light' ? 'light' : 'dark';
		const cookieVal = this.cookie.getItem('theme');
		if (cookieVal) {
			startTheme = cookieVal === 'light' ? 'light' : 'dark';
		}
		this.themeSubject = new BehaviorSubject<'light' | 'dark'>(startTheme);
		this.theme$ = this.themeSubject.asObservable();
	}

	public set theme(theme: 'light' | 'dark') {
		this.cookie.setItem('theme', theme, undefined, 'strict');
		this.themeSubject.next(theme);
	}

}
