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
			this.cookies = this._getPairs();
		} else {
			this.document = document;
		}
	}

	public getItem(name: string): string | null {
		const cookies: { [key: string]: string | null } = this._getPairs();
		if (name && typeof cookies[name] !== 'undefined') {
			return cookies[name];
		}
		return null;
	}

	public setItem(
		name: string,
		value: string,
		expiry?: Date | string,
		sameSite?: boolean | "lax" | "strict" | "none",
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
						sameSite,
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

	public removeItem(name: string, path?: string): boolean {
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

	private _getPairs(): { [key: string]: string | null } {
		let parsed;
		if (this.req === null) {
			parsed = this.document.cookie.split('; ');
		} else {
			if (!this.req.headers.cookie) {
				return {}; // No cookies available
			}
			parsed = this.req.headers.cookie.split('; ');	
		}
		const cookies: { [key: string]: string | null } = {};
		parsed.forEach((element: string) => {
			if (element) {
				const pair = element.split('=');
				cookies[pair[0]] =
					typeof pair[1] !== 'undefined' ? pair[1] : null;
			}
		});
		return cookies;
	}

}
