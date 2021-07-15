import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StarRatingComponent } from './star-rating/star-rating.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
	declarations: [
		StarRatingComponent
	],
	imports: [
		CommonModule,

		MatTooltipModule,
		MatButtonModule,
		MatIconModule
	],
	exports: [
		StarRatingComponent
	]
})
export class StarRatingModule { }
