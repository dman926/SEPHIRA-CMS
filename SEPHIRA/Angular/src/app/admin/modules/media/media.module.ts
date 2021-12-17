import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaRoutingModule } from './media-routing.module';
import { MediaComponent } from './pages/media/media.component';
import { MediaBrowserModule } from 'src/app/features/media-browser/media-browser.module';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
	declarations: [
		MediaComponent
	],
	imports: [
		CommonModule,
		MediaRoutingModule,
		ReactiveFormsModule,

		MediaBrowserModule
	]
})
export class MediaModule { }
