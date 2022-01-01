import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WysiwygComponent } from './components/wysiwyg/wysiwyg.component';
import { NgxEditorModule } from 'ngx-editor';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
	declarations: [
		WysiwygComponent
	],
	imports: [
		CommonModule,
		ReactiveFormsModule,

		NgxEditorModule
	],
	exports: [
		WysiwygComponent
	]
})
export class WysiwygModule { }
