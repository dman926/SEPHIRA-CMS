import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { LEFT_ARROW, RIGHT_ARROW, SPACE, F } from '@angular/cdk/keycodes';
import { FileService } from 'src/app/features/media-browser/services/file/file.service';
import { Media } from 'src/app/models/media';
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

	constructor(private file: FileService) {
		this.player = null;
		this.options = {
			fluid: true,
			userActions: {
				hotkeys: ev => {
					if (this.player) {
						if (ev.which === LEFT_ARROW) {
							this.player.currentTime(this.player.currentTime() - 10);
						} else if (ev.which === RIGHT_ARROW) {
							this.player.currentTime(this.player.currentTime() + 10);
						} else if (ev.which === SPACE) {
							if (this.player.paused()) {
								this.player.play();
							} else {
								this.player.pause();
							}
						} else if (ev.which === F) {
							if (this.player.isFullscreen()) {
								this.player.exitFullscreen();
							} else {
								this.player.requestFullscreen();
							}
						}
					}
				}
			}
		};
	}

	ngOnInit(): void {
		this.player = videojs('main', this.options, () => {
			
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

	addTrack(options: videojs.TextTrackOptions, manualCleanup?: boolean): HTMLTrackElement | null {
		if (this.player) {
			return this.player.addRemoteTextTrack(options, manualCleanup ? manualCleanup : false);
		}
		return null;
	}

	addMedia(media: Media, reset?: boolean): boolean {
		if (this.player) {
			if (reset) {
				this.player.reset();
			}
			const toAdd = [media].concat(media.associatedMedia ? media.associatedMedia : []);
			toAdd.forEach(media => {
				if (this.player) {
				const streamUrl = this.file.getStreamUrl(media.folder, media.filename, media.id);
					if (this.isVideo(media.mimetype)) {
						this.player.src({
							src: streamUrl,
							type: media.mimetype
						});
					} else if (this.isImage(media.mimetype)) {
						this.player.poster(streamUrl);
					} else if (this.isText(media.mimetype)) {
						let metadata: any = media.metadata ? media.metadata : {};
						metadata.src = streamUrl;
						this.player.addRemoteTextTrack(metadata as videojs.TextTrackOptions, false);
					}
				}
			});
			return true;
		}
		return false;
	}

	private isImage(mimetype?: string): boolean {
		if (mimetype) {
			return mimetype.substring(0, 5) === 'image';
		}
		return false;
	}

	private isVideo(mimetype?: string): boolean {
		if (mimetype) {
			return mimetype.substring(0, 5) === 'video';
		}
		return false;
	}

	private isText(mimetype?: string): boolean {
		if (mimetype) {
			return mimetype.substring(0, 4) === 'text';
		}
		return false;
	}

}
