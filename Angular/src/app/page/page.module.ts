import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PageRoutingModule } from './page-routing.module';
import { PageComponent } from './page/page.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@NgModule({
	declarations: [
		PageComponent
	],
	imports: [
		CommonModule,
		PageRoutingModule,

		MatProgressSpinnerModule
	]
})
export class PageModule { }
