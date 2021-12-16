import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent } from './pages/home/home.component';

import { MatButtonModule } from '@angular/material/button';
import { VideoPlayerModule } from 'src/app/features/video-player/video-player.module';


@NgModule({
	declarations: [
		HomeComponent
	],
	imports: [
		CommonModule,
		HomeRoutingModule,

		MatButtonModule,

		VideoPlayerModule
	]
})
export class AdminModule { }
