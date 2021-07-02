import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PostRoutingModule } from './post-routing.module';
import { PostComponent } from './post/post.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@NgModule({
	declarations: [
		PostComponent
	],
	imports: [
		CommonModule,
		PostRoutingModule,

		MatProgressSpinnerModule
	]
})
export class PostModule { }
