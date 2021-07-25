import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class AuthGuard implements CanActivate {
	constructor(private router: Router, private cookie: CookieService) { }
	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		const allowed = this.cookie.hasKey('accessToken');
		if (!allowed) {
			this.router.navigate(['']);
		}
		return allowed;
	}

}
