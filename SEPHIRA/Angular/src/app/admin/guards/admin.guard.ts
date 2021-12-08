import { Injectable } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	CanActivate,
	Router,
	RouterStateSnapshot,
	UrlTree,
} from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from 'src/app/features/auth/services/auth/auth.service';

@Injectable({
	providedIn: 'root',
})
export class AdminGuard implements CanActivate {

	constructor(private auth: AuthService, private router: Router) { }

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	):
		| Observable<boolean | UrlTree>
		| Promise<boolean | UrlTree>
		| boolean
		| UrlTree {
		return this.auth.user$.pipe(take(1), map(user => {
			const admin = user?.admin ? true : false;
			if (!admin) {
				this.router.navigate(['/login']);
			}
			return admin;
		}));
	}

}
