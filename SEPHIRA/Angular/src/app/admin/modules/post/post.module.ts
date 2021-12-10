import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PostRoutingModule } from './post-routing.module';
import { PostComponent } from './pages/post/post.component';
import { PostsComponent } from './pages/posts/posts.component';
import { PostSelectModule } from '../features/post-select/post-select.module';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { LoaderSpinnerModule } from 'src/app/features/loader-spinner/loader-spinner.module';


@NgModule({
	declarations: [
		PostComponent,
		PostsComponent
	],
	imports: [
		CommonModule,
		PostRoutingModule,
		ReactiveFormsModule,

		MatPaginatorModule,
		MatButtonModule,
		MatFormFieldModule,
		MatInputModule,
		MatTableModule,
		MatSelectModule,
		MatCheckboxModule,
		MatIconModule,

		PostSelectModule,
		LoaderSpinnerModule
	]
})
export class PostModule { }
