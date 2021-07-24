import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { PlatformService } from '../core/services/platform.service';

@Injectable({
	providedIn: 'root'
})
export class AdminGuard implements CanActivate {

	constructor(private platformService: PlatformService) { }

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
			if (this.platformService.isServer()) {
				return false;
			}
			const cachedUser = localStorage.getItem('user');
			if (cachedUser) {
				return JSON.parse(cachedUser).admin;
			}
			return false;
	}

}
