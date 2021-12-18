import { Component, ElementRef, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';

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

	addTrack(source: string | SafeUrl, kind: string, label?: string, srclang?: string, d?: boolean): HTMLTrackElement | null {
		if (this.video) {
			const trackEl: HTMLTrackElement = this.renderer.createElement('track');
			this.renderer.setProperty(trackEl, 'src', source);
			//trackEl.setAttribute('src', source);
			trackEl.setAttribute('kind', kind);
			if (label) {
				trackEl.setAttribute('label', label);
			}
			if (srclang) {
				trackEl.setAttribute('srclang', srclang);
			}
			if (d) {
				trackEl.setAttribute('default', '');
			}
			this.video.nativeElement.appendChild(trackEl);
			return trackEl;
		}
		return null;
	}

	removeEl(el: HTMLElement): boolean {
		if (this.video) {
			return !!this.video.nativeElement.removeChild(el);
		}
		return false;
	}

}
