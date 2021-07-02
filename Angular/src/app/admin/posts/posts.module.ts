import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostsRoutingModule } from './posts-routing.module';
import { PostsComponent } from './posts/posts.component';
import { PostComponent } from './post/post.component';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';



@NgModule({
	declarations: [
		PostsComponent,
  PostComponent
	],
	imports: [
		CommonModule,
		PostsRoutingModule,

		MatPaginatorModule,
		MatButtonModule,
		MatProgressSpinnerModule
	]
})
export class PostsModule { }
