import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostsRoutingModule } from './posts-routing.module';
import { PostsComponent } from './posts/posts.component';
import { PostComponent } from './post/post.component';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
	declarations: [
		PostsComponent,
  PostComponent
	],
	imports: [
		CommonModule,
		PostsRoutingModule,
		ReactiveFormsModule,

		MatPaginatorModule,
		MatButtonModule,
		MatProgressSpinnerModule,

		AngularEditorModule
	]
})
export class PostsModule { }
