import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

interface Script {
	name: string;
	src: string;		
}

export const ScriptStore: Script[] = [
	{ name: 'stripe', src: 'https://js.stripe.com/v3/' },
	{ name: 'paypal', src: 'https://www.paypal.com/sdk/js?client-id=' + environment.paypalClientID + '&currency=' + environment.paypalCurrency + '&intent=capture' }
];

@Injectable({
	providedIn: 'root',
})
export class DynamicScriptLoaderService {

	private scripts: any = {};

	constructor(@Inject(DOCUMENT) private document: Document) {
		ScriptStore.forEach(script => {
			this.scripts[script.name] = {
				loaded: false,
				src: script.src
			};
		});
	}

	load(...scripts: string[]) {
		const promises: Promise<any>[] = [];
		scripts.forEach(script => promises.push(this.loadScript(script)));
		return Promise.all(promises);
	}

	private loadScript(name: string): Promise<any> {
		return new Promise((resolve, reject) => {
			if (!this.scripts[name].loaded) {
				// Load script
				let script = this.document.createElement('script');
				script.type = 'text/javascript';
				script.src = this.scripts[name].src;
				script.onload = () => {
					this.scripts[name].loaded = true;
					resolve({ script: name, loaded: true, status: 'loaded' });
				};
				script.onerror = (error: any) => resolve({ script: name, loaded: false, status: 'not loaded' });
				this.document.head.appendChild(script);
			} else {
				resolve({ script: name, loaded: true, status: 'already loaded' });
			}
		});
	}

}
