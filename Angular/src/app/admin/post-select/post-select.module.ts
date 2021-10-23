import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostSelectComponent } from './post-select/post-select.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';



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
		MatProgressSpinnerModule
	],
	exports: [
		PostSelectComponent
	]
})
export class PostSelectModule { }
