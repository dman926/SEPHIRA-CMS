import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
	providedIn: 'root'
})
export class SeoService {

	constructor(private title: Title, private meta: Meta, @Inject(DOCUMENT) private dom: Document) { }

	setCanonicalUrl(url?: string): void {
		const canUrl = url === undefined ? this.dom.URL : url;
		let link: HTMLLinkElement | null = this.dom.querySelector('link[rel="canonical"]') || null;
		if (!link) {
			link = this.dom.createElement('link');
			this.dom.head.appendChild(link);
		}
		link.setAttribute('rel', 'canonical');
		link.setAttribute('href', canUrl);
	}

	setTitle(title: string): void {
		this.title.setTitle(title);
	}

	addTag(name: string, content: string): void {
		this.meta.addTag({name, content});
	}

	updateTag(name: string, content: string): void {
		const tag: HTMLMetaElement | null = this.meta.getTag('name="' + name + '"');
		console.log(tag);
		const tagDef = { name, content }
		if (tag) {
			this.meta.updateTag(tagDef, 'name="' + name + '"');
		} else {
			this.meta.addTag(tagDef);
		}
	}

}
