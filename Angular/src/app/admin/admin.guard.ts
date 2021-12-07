import { Injectable } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import {
	ActivatedRouteSnapshot,
	CanActivate,
	RouterStateSnapshot,
	UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { PlatformService } from '../core/services/platform/platform.service';
import { User } from '../models/user';

@Injectable({
	providedIn: 'root',
})
export class AdminGuard implements CanActivate {

	constructor(private platform: PlatformService, private state: TransferState) { }

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	):
		| Observable<boolean | UrlTree>
		| Promise<boolean | UrlTree>
		| boolean
		| UrlTree {
		if (this.platform.isServer) {
			return true;
		}
		const cachedUser = this.state.get<User | null>(makeStateKey('user'), null);
		if (cachedUser) {
			return cachedUser.admin ? cachedUser.admin : false;
		}
		return false;
	}

}
