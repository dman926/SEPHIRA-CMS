import { AfterContentInit, Component, ElementRef, Input, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from 'video.js';

@Component({
	selector: 'sephira-video-player',
	templateUrl: './video-player.component.html',
	styleUrls: ['./video-player.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class VideoPlayerComponent implements AfterContentInit, OnDestroy {

	@Input() options: VideoJsPlayerOptions;

	@ViewChild('target', { static: true }) target: ElementRef | undefined;

	private player: VideoJsPlayer | null;

	constructor() {
		this.options = {
			controls: true,
			fluid: true
		};
		this.player = null;
	}

	ngAfterContentInit(): void {
		if (this.target) {
			this.player = videojs(this.target.nativeElement, this.options, () => {
				console.log('onPlayerReady', this);
			});	
		}
	}

	ngOnDestroy(): void {
		if (this.player) {
			this.player.dispose();
		}
	}

}
