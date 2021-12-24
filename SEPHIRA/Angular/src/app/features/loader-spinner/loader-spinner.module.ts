import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderSpinnerComponent } from './components/loader-spinner/loader-spinner.component';
import { LoaderBarComponent } from './components/loader-bar/loader-bar.component';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
	declarations: [
		LoaderSpinnerComponent,
		LoaderBarComponent
	],
	imports: [
		CommonModule,

		MatProgressSpinnerModule,
		MatProgressBarModule
	],
	exports: [
		LoaderSpinnerComponent,
		LoaderBarComponent
	]
})
export class LoaderSpinnerModule { }
