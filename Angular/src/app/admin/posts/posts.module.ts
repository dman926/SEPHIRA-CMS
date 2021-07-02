import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostsRoutingModule } from './posts-routing.module';
import { PostsComponent } from './posts/posts.component';
import { PostComponent } from './post/post.component';



@NgModule({
	declarations: [
		PostsComponent,
  PostComponent
	],
	imports: [
		CommonModule,
		PostsRoutingModule
	]
})
export class PostsModule { }
