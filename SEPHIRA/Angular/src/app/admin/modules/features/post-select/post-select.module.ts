import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostSelectComponent } from './components/post-select/post-select.component';
import { ReactiveFormsModule } from '@angular/forms';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';

import { LoaderSpinnerModule } from 'src/app/features/loader-spinner/loader-spinner.module';



@NgModule({
	declarations: [
		PostSelectComponent
	],
	imports: [
		CommonModule,

		ReactiveFormsModule,

		MatCheckboxModule,
		MatPaginatorModule,
		MatCardModule,

		LoaderSpinnerModule
	],
	exports: [
		PostSelectComponent
	]
})
export class PostSelectModule { }
