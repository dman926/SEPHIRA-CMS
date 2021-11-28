import { Inject, Injectable, Optional } from '@angular/core';
import { REQUEST, RESPONSE } from '@nguniversal/express-engine/tokens';
import { Request, Response } from 'express';

@Injectable({
	providedIn: 'root',
})
export class CookieService {
	cookies: any = {};
	document: any = { cookie: '' };

	constructor(
		@Optional() @Inject(REQUEST) private req: Request<any>,
		@Optional() @Inject(RESPONSE) private res: Response<any>
	) {
		if (this.req !== null) {
			this.cookies = this.req.cookies;
		} else {
			this.document = document;
		}
	}

	getItem(name: string): string | null {
		const cookies: { [key: string]: string | null } = this._getPairs();
		if (name && typeof cookies[name] !== 'undefined') {
			return cookies[name];
		}
		return null;
	}

	setItem(
		name: string,
		value: string,
		expiry?: Date | string,
		path?: string
	): boolean {
		if (!name) {
			return false;
		}
		if (!path) {
			path = '/';
		}
		if (this.req === null) {
			let expiryStr = '';
			if (expiry) {
				if (!(expiry instanceof Date)) {
					expiry = new Date(expiry);
				}
				expiryStr = '; expires=' + expiry.toUTCString();
			}
			this.document.cookie = `${name}=${value}${expiryStr}; path=${path}`;
		} else {
			if (expiry) {
				if (!(expiry instanceof Date)) {
					expiry = new Date(expiry);
				}
				const dt = new Date();
				if (expiry.getTime() <= dt.getTime()) {
					this.removeItem(name, path);
				} else {
					this.cookies[name] = value;
					this.res.cookie(name, value, {
						expires: expiry,
						path,
						encode: String,
					});
				}
			} else {
				this.cookies[name] = value;
				this.res.cookie(name, value, { path, encode: String });
			}
		}
		return true;
	}

	removeItem(name: string, path?: string): boolean {
		if (this.req !== null || !name) {
			return false;
		}
		if (!path) {
			path = '/';
		}
		if (this.req === null) {
			this.document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
		} else {
			this.cookies[name] = null;
			const expiry = new Date('Thu, 01 Jan 1970 00:00:00 UTC');
			this.res.cookie(name, null, {
				expires: expiry,
				path,
				encode: String,
			});
		}
		return true;
	}

	_getPairs(): { [key: string]: string | null } {
		if (this.req === null) {
			const parsed = this.document.cookie.split('; ');
			const cookies: { [key: string]: string | null } = {};
			parsed.forEach((element: string) => {
				if (element) {
					const pair = element.split('=');
					cookies[pair[0]] =
						typeof pair[1] !== 'undefined' ? pair[1] : null;
				}
			});
			return cookies;
		} else {
			return this.cookies;
		}
	}

}
