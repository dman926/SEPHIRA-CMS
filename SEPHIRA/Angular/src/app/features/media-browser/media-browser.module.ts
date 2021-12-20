import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MediaBrowserComponent } from './components/media-browser/media-browser.component';
import { CreateFolderDialogComponent } from './components/create-folder-dialog/create-folder-dialog.component';
import { AssociatedMediaDialogComponent } from './components/associated-media-dialog/associated-media-dialog.component';

import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { LoaderSpinnerModule } from '../loader-spinner/loader-spinner.module';
import { VideoPlayerModule } from '../video-player/video-player.module';
import { MatSelectModule } from '@angular/material/select';
import { MetadataEditorComponent } from './components/metadata-editor/metadata-editor.component';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';



@NgModule({
	declarations: [
		MediaBrowserComponent,
		CreateFolderDialogComponent,
		AssociatedMediaDialogComponent,
		MetadataEditorComponent
	],
	imports: [
		CommonModule,
		ReactiveFormsModule,

		MatListModule,
		MatExpansionModule,
		MatButtonModule,
		MatIconModule,
		MatDialogModule,
		MatFormFieldModule,
		MatInputModule,
		MatProgressSpinnerModule,
		MatProgressBarModule,
		MatSelectModule,
		MatCheckboxModule,
		MatCardModule,

		LoaderSpinnerModule,
		VideoPlayerModule
	],
	exports: [
		MediaBrowserComponent
	]
})
export class MediaBrowserModule { }
