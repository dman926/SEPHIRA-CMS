import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

interface Scripts {
	name: string;
	src: string;
}

export const ScriptStore: Scripts[] = [
	{ name: 'stripe', src: 'https://js.stripe.com/v3/' },
	{ name: 'paypal', src: 'https://www.paypal.com/sdk/js?client-id=' + environment.paypalClientID + '&currency=USD&intent=capture' }
];

@Injectable({
	providedIn: 'root'
})
export class DynamicScriptLoaderService {

	private scripts: any = {};

	constructor() {
		ScriptStore.forEach((script: any) => {
			this.scripts[script.name] = {
				loaded: false,
				src: script.src
			};
		});
	}

	load(...scripts: string[]) {
		const promises: any[] = [];
		scripts.forEach((script) => promises.push(this.loadScript(script)));
		return Promise.all(promises);
	}

	loadScript(name: string) {
		return new Promise((resolve, reject) => {
			if (!this.scripts[name].loaded) {
				//load script
				let script = document.createElement('script');
				script.type = 'text/javascript';
				script.src = this.scripts[name].src;
				script.onload = () => {
					this.scripts[name].loaded = true;
					resolve({ script: name, loaded: true, status: 'Loaded' });
				};
				script.onerror = (error: any) => resolve({ script: name, loaded: false, status: 'Loaded' });
				document.getElementsByTagName('head')[0].appendChild(script);
			} else {
				resolve({ script: name, loaded: true, status: 'Already Loaded' });
			}
		});
	}

}