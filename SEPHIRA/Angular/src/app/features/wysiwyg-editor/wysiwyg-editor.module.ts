import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WysiwygComponent } from './components/wysiwyg/wysiwyg.component';
import { NgxEditorModule } from 'ngx-editor';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';



@NgModule({
	declarations: [
		WysiwygComponent
	],
	imports: [
		CommonModule,
		ReactiveFormsModule,

		MatInputModule,
		MatButtonModule,
		MatIconModule,

		NgxEditorModule
	],
	exports: [
		WysiwygComponent
	]
})
export class WysiwygEditorModule { }
