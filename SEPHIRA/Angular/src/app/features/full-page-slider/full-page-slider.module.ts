import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { FullPageSliderComponent } from './components/full-page-slider/full-page-slider.component';



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
