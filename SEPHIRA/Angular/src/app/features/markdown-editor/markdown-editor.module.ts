import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { MarkdownEditorComponent } from './components/markdown-editor/markdown-editor.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';


@NgModule({
	declarations: [
		MarkdownEditorComponent,
	],
	imports: [
		CommonModule,
		ReactiveFormsModule,

		MatFormFieldModule,
		MatInputModule,

		MarkdownModule.forChild()
	],
	exports: [
		MarkdownEditorComponent
	]
})
export class MarkdownEditorModule { }
