import { AfterContentInit, Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import videojs, { VideoJsPlayerOptions } from 'video.js';

@Component({
	selector: 'sephira-video-player',
	templateUrl: './video-player.component.html',
	styleUrls: ['./video-player.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class VideoPlayerComponent implements OnInit, OnDestroy {

	@Input() private options: VideoJsPlayerOptions;

	@ViewChild('media', { static: true }) private video: ElementRef | undefined;

	player: videojs.Player | null;

	constructor(private renderer: Renderer2) {
		this.player = null;
		this.options = {
			fluid: true
		};
	}

	ngOnInit(): void {
		console.log(this.video);
		this.player = videojs('main', this.options, () => {
			console.log('player ready');
			console.log('onPlayerReady', this);
		});
	}

	ngOnDestroy(): void {
		if (this.player) {
			this.player.dispose();
		}
	}

	setSource(src: string, type: string): boolean {
		if (this.player) {
			this.player.src({
				src,
				type
			});
			return true;
		}
		return false
	}

	resetPlayer(): boolean {
		if (this.player) {
			this.player.reset();
			return true;
		}
		return false;
	}

}
