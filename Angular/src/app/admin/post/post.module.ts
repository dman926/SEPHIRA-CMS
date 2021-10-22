import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PostRoutingModule } from './post-routing.module';
import { PostsComponent } from './posts/posts.component';
import { PostComponent } from './post/post.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
	declarations: [
		PostsComponent,
		PostComponent
	],
	imports: [
		CommonModule,
		PostRoutingModule,

		MatPaginatorModule,
		MatProgressSpinnerModule,
		MatButtonModule
	]
})
export class PostModule { }
