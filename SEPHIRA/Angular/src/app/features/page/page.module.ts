import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PageRoutingModule } from './page-routing.module';
import { PageComponent } from './pages/page/page.component';
import { LoaderSpinnerModule } from '../loader-spinner/loader-spinner.module';
import { MarkdownEditorModule } from '../markdown-editor/markdown-editor.module';


@NgModule({
	declarations: [
		PageComponent
	],
	imports: [
		CommonModule,
		PageRoutingModule,

		LoaderSpinnerModule,
		MarkdownEditorModule
	]
})
export class PageModule { }
