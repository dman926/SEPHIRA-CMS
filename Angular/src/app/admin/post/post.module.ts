import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PostRoutingModule } from './post-routing.module';
import { PostsComponent } from './posts/posts.component';
import { PostComponent } from './post/post.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';

@NgModule({
	declarations: [
		PostsComponent,
		PostComponent
	],
	imports: [
		CommonModule,
		PostRoutingModule,

		ReactiveFormsModule,

		MatPaginatorModule,
		MatProgressSpinnerModule,
		MatButtonModule,
		MatFormFieldModule,
		MatInputModule,
		MatTableModule
	]
})
export class PostModule { }
