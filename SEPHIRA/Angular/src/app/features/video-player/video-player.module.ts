import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoPlayerComponent } from './components/video-player/video-player.component';

import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';

@NgModule({
	declarations: [
		VideoPlayerComponent
	],
	imports: [
		CommonModule,

		VgCoreModule,
		VgControlsModule,
		VgOverlayPlayModule,
		VgBufferingModule
	],
	exports: [
		VideoPlayerComponent
	]
})
export class VideoPlayerModule { }
