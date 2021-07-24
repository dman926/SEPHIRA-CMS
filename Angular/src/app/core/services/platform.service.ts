import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class PlatformService {

  	constructor(@Inject(PLATFORM_ID) public platformId: Object) { }

	public isBrowser(): boolean {
		return isPlatformBrowser(this.platformId);
	}

	public isServer(): boolean {
		return isPlatformServer(this.platformId);
	}

}
