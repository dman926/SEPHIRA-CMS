import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullPageSliderComponent } from './full-page-slider/full-page-slider.component';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
	declarations: [
		FullPageSliderComponent
	],
	imports: [
		CommonModule,
		RouterModule,

		MatButtonModule
	],
	exports: [
		FullPageSliderComponent
	]
})
export class FullPageSliderModule { }
