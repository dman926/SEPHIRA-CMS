import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PostRoutingModule } from './post-routing.module';
import { PostComponent } from './pages/post/post.component';
import { PostSelectModule } from '../features/post-select/post-select.module';
import { PostsComponent } from './pages/posts/posts.component';


@NgModule({
	declarations: [
		PostComponent,
  PostsComponent
	],
	imports: [
		CommonModule,
		PostRoutingModule,

		PostSelectModule
	]
})
export class PostModule { }
