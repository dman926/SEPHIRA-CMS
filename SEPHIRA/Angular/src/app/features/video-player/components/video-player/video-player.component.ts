import { Component, ElementRef, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';

@Component({
	selector: 'sephira-video-player',
	templateUrl: './video-player.component.html',
	styleUrls: ['./video-player.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class VideoPlayerComponent {

	@ViewChild('media') private video: ElementRef | undefined;

	constructor(private renderer: Renderer2) { }

	addSource(source: string, type: string): HTMLSourceElement | null {
		if (this.video) {
			const sourceEl: HTMLSourceElement = this.renderer.createElement('source');
			sourceEl.setAttribute('src', source);
			sourceEl.setAttribute('type', type);
			this.video.nativeElement.appendChild(sourceEl);
			return sourceEl;
		}
		return null;
	}

	removeSource(el: HTMLSourceElement): boolean {
		if (this.video) {
			return !!this.video.nativeElement.removeChild(el);
		}
		return false;
	}

}
