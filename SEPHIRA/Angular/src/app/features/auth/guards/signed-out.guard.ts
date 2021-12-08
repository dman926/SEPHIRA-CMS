import { Injectable } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	CanActivate,
	Router,
	RouterStateSnapshot,
	UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { CookieService } from 'src/app/core/services/cookie/cookie.service';

@Injectable({
	providedIn: 'root',
})
export class SignedOutGuard implements CanActivate {

	constructor(private cookie: CookieService, private router: Router) { }

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	):
		| Observable<boolean | UrlTree>
		| Promise<boolean | UrlTree>
		| boolean
		| UrlTree {
		const isSignedOut = this.cookie.getItem('accessToken') === null;
		if (!isSignedOut) {
			this.router.navigate(['/']);
		}
		return isSignedOut;
	}

}
