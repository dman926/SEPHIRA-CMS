import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaBrowserComponent } from './media-browser/media-browser.component';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';

@NgModule({
	declarations: [MediaBrowserComponent],
	imports: [
		CommonModule,

		ReactiveFormsModule,

		MatProgressSpinnerModule,
		MatButtonModule,
		MatIconModule,
		MatPaginatorModule,
		MatCheckboxModule,
		MatSelectModule,
		MatCardModule
	],
	exports: [MediaBrowserComponent]
})
export class MediaBrowserModule { }
