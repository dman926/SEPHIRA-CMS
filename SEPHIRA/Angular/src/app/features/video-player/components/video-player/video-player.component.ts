import { Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { LEFT_ARROW, RIGHT_ARROW, SPACE, F } from '@angular/cdk/keycodes';
import { FileService } from 'src/app/features/media-browser/services/file/file.service';
import { Media } from 'src/app/models/media';
import videojs, { VideoJsPlayerOptions } from 'video.js';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { MenuItemsComponent } from 'src/app/admin/modules/menu-items/pages/menu-items/menu-items.component';

@Component({
	selector: 'sephira-video-player',
	templateUrl: './video-player.component.html',
	styleUrls: ['./video-player.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class VideoPlayerComponent implements OnInit, OnDestroy {

	@Input() private options: VideoJsPlayerOptions;

	@ViewChild('video', { static: true }) private video: ElementRef<HTMLVideoElement> | undefined;
	@ViewChild('audio', { static: true }) private audio: ElementRef<HTMLAudioElement> | undefined;

	player: videojs.Player | null;

	videoTracks: Media[];
	audioTracks: Media[];

	videoTrackMenuButton: videojs.MenuButton | null;
	videoTrackMenu: videojs.Menu | null;
	audioTrackMenuButton: videojs.MenuButton | null;
	audioTrackMenu: videojs.Menu | null;

	private audioBuffering = false;

	constructor(private file: FileService, private platform: PlatformService, private renderer: Renderer2) {
		this.player = null;
		this.videoTracks = [];
		this.audioTracks = [];
		this.videoTrackMenuButton = null;
		this.videoTrackMenu = null;
		this.audioTrackMenuButton = null;
		this.audioTrackMenu = null;
		this.options = {
			fluid: true,
			preload: 'auto',
			textTrackSettings: {
				persistTextTrackSettings: true
			},
			userActions: {
				hotkeys: ev => {
					if (this.player && this.audio) {
						if (ev.which === LEFT_ARROW) {
							const newTime = Math.max(this.player.currentTime() - 10, 0)
							this.player.currentTime(newTime);
							this.audio.nativeElement.currentTime = newTime;
						} else if (ev.which === RIGHT_ARROW) {
							const newTime = this.player.currentTime() + 10
							this.player.currentTime(newTime);
							this.audio.nativeElement.currentTime = newTime;
						} else if (ev.which === SPACE) {
							if (this.player.paused()) {
								this.player.play();
								if (this.audio.nativeElement.hasChildNodes() && this.audio.nativeElement.paused) {
									this.audio.nativeElement.play();
								}
							} else {
								this.player.pause();
								if (this.audio.nativeElement.hasChildNodes() && this.audio.nativeElement.paused) {
									this.audio.nativeElement.pause();
								}
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
		if (this.video && this.platform.isBrowser) {
			this.player = videojs(this.video.nativeElement, this.options, () => {
				setInterval(() => {
					if (this.player && this.audio) {
						this.audio.nativeElement.currentTime = this.player.currentTime();
						if (this.audioBuffering && this.audio.nativeElement.networkState !== 2) {
							this.player.play();
						}
						this.audioBuffering = this.audio.nativeElement.networkState === 2;
						if (this.audioBuffering) {
							this.player.pause();
						}
					}
				}, 500);
			});
			// Listeners to sync audio player with video player
			this.player.on('play', () => {
				if (this.audio && this.audio.nativeElement.hasChildNodes() && this.audio.nativeElement.paused) {
					this.audio.nativeElement.play();
				}
			});
			this.player.on('pause', () => {
				if (this.audio && this.audio.nativeElement.hasChildNodes() && !this.audio.nativeElement.paused) {
					this.audio.nativeElement.pause();
				}
			});
			this.player.on('volumechange', () => {
				if (this.player && this.audio) {
					this.audio.nativeElement.volume = this.player.volume();
				}
			});
			this.player.on('seeking', () => {
				if (this.player && this.audio) {
					this.audio.nativeElement.currentTime = this.player.currentTime();
				}
			});
			this.player.on('waiting', () => {
				if (this.audio) {
					this.audio.nativeElement.pause();
				}
			});
			this.player.on('playing', () => {
				if (this.player && !this.player.paused() && this.audio) {
					this.audio.nativeElement.play();
				}
			});
		}
	}

	ngOnDestroy(): void {
		if (this.player) {
			this.player.dispose();
		}
	}

	resetPlayer(): void {
		if (this.player) {
			this.player.reset();
			this.videoTracks = [];
		}
		if (this.audio) {
			const audioEl = this.audio.nativeElement;
			audioEl.pause();
			audioEl.currentTime = 0;
			while (audioEl.lastChild) {
				audioEl.removeChild(audioEl.lastChild)
			}
			this.audioTracks = [];
		}
	}

	addMedia(media: Media, reset?: boolean): boolean {
		if (this.player) {
			if (reset) {
				this.resetPlayer();
			}
			const toAdd = [media].concat(media.associatedMedia ? media.associatedMedia : []);
			toAdd.forEach(media => {
				if (this.player && this.audio && !media.container) {
					const streamUrl = this.file.getStreamUrl(media.folder, media.filename, media.id);
					if (this.isVideo(media.mimetype)) {
						if (media.metadata?.default) {
							this.player.src({
								src: streamUrl,
								type: media.mimetype
							});	
						}
						this.videoTracks.push(media);
					} else if (this.isAudio(media.mimetype)) {
						if (media.metadata?.default) {
							const sourceEl: HTMLSourceElement = this.renderer.createElement('source');
							sourceEl.src = streamUrl;
							if (media.mimetype) {
								sourceEl.type = media.mimetype;
							}
							this.audio.nativeElement.append(sourceEl);	
						}
						this.audioTracks.push(media);
					} else if (this.isImage(media.mimetype)) {
						this.player.poster(streamUrl);
					} else if (this.isText(media.mimetype)) {
						let metadata: videojs.TextTrackOptions = {};
						if (media.metadata) {
							metadata = {
								kind: media.metadata.textKind,
								mode: media.metadata.mode,
								srclang: media.metadata.srclang,
								label: media.metadata.label,
								default: media.metadata.default
							};
						}
						metadata.src = streamUrl;
						this.player.addRemoteTextTrack(metadata, false);
					}
				}
			});
			const MenuItem = videojs.getComponent('MenuItem');
			if (this.videoTracks.length > 1) {
				if (this.player) {
					this.videoTrackMenuButton = this.player.controlBar.addChild('MenuButton') as videojs.MenuButton;
					this.videoTrackMenuButton.addClass('video-stream-selector');
					this.videoTrackMenu = this.videoTrackMenuButton.addChild('Menu') as videojs.Menu;
					for (let i = 0; i < this.videoTracks.length; i++) {
						const options: videojs.MenuItemOptions = {
							label: this.videoTracks[i].filename,
							multiSelectable: false,
							selectable: true,
							selected: i === 0
						};
						const item: videojs.MenuItem = new MenuItem(this.player, options);
						this.videoTrackMenu.addItem(item);
					}
					this.videoTrackMenuButton.on('click', () => {
						if (this.videoTrackMenu) {
							if (this.videoTrackMenu.hasClass('menu-show')) {
								this.videoTrackMenu.removeClass('menu-show');
							} else {
								this.videoTrackMenu.addClass('menu-show');
							}
						}
					});
				}
			}
			if (this.audioTracks.length > 1) {
				if (this.player) {
					this.audioTrackMenuButton = this.player.controlBar.addChild('MenuButton') as videojs.MenuButton;
					this.audioTrackMenuButton.addClass('audio-stream-selector');
					this.audioTrackMenu = this.audioTrackMenuButton.addChild('Menu') as videojs.Menu;
					for (let i = 0; i < this.audioTracks.length; i++) {
						const options: videojs.MenuItemOptions = {
							label: this.audioTracks[i].filename,
							multiSelectable: false,
							selectable: true,
							selected: i === 0
						};
						const item: videojs.MenuItem = new MenuItem(this.player, options);
						this.audioTrackMenu.addItem(item);
					}
					this.audioTrackMenuButton.on('click', () => {
						if (this.audioTrackMenu) {
							if (this.audioTrackMenu.hasClass('menu-show')) {
								this.audioTrackMenu.removeClass('menu-show');
							} else {
								this.audioTrackMenu.addClass('menu-show');
							}
						}
					});
				}
			}
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

	private isAudio(mimetype?: string): boolean {
		if (mimetype) {
			return mimetype.substring(0, 5) === 'audio';
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
