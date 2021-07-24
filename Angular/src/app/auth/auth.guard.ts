import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PlatformService } from '../core/services/platform.service';

@Injectable({
	providedIn: 'root'
})
export class AuthGuard implements CanActivate {
	constructor(private router: Router, private platformService: PlatformService) { }
	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		if (this.platformService.isServer()) {
			return false;
		}
		const allowed = !!localStorage.getItem('accessToken');
		if (!allowed) {
			this.router.navigate(['']);
		}
		return allowed;
	}

}
