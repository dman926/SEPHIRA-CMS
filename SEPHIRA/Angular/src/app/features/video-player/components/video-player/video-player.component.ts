import { Component, ElementRef, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { IPlayable, VgApiService } from '@videogular/ngx-videogular/core';

@Component({
	selector: 'sephira-video-player',
	templateUrl: './video-player.component.html',
	styleUrls: ['./video-player.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class VideoPlayerComponent {

	@ViewChild('media') private video: ElementRef | undefined;

	api: VgApiService | null;

	constructor(private renderer: Renderer2) {
		this.api = null;
	}

	onPlayerReady(api: VgApiService): void {
		this.api = api;
		console.log('video api loaded');
	}

	addSource(id: string, source: string, type: string): HTMLSourceElement | null {
		if (this.video && this.api) {
			const sourceEl: HTMLSourceElement = this.renderer.createElement('source');
			sourceEl.setAttribute('src', source);
			sourceEl.setAttribute('type', type);
			//this.video.nativeElement.appendChild(sourceEl);

			//this.api.registerMedia();
			return sourceEl;
		}
		return null;
	}

	addTrack(source: string | SafeUrl, kind: string, label?: string, srclang?: string, d?: boolean): HTMLTrackElement | null {
		console.log(this.api);
		if (this.video && this.api) {
			const trackEl: HTMLTrackElement = this.renderer.createElement('track');
			this.renderer.setProperty(trackEl, 'src', source);
			this.renderer.setProperty(trackEl, 'kind', kind);
			if (label) {
				this.renderer.setProperty(trackEl, 'label', label);
			}
			if (srclang) {
				this.renderer.setProperty(trackEl, 'srclang', srclang);
			}
			if (d) {
				this.renderer.setProperty(trackEl, 'default', true);
			}
			/*this.renderer.appendChild(this.video.nativeElement, trackEl);*/
			this.api.addTextTrack(kind, label, srclang);
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
