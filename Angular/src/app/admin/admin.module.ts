import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { HomeComponent } from './home/home.component';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClientModule } from '@angular/common/http';
import { PostsComponent } from './posts/posts.component';


@NgModule({
	declarations: [
		HomeComponent,
  PostsComponent
	],
	imports: [
		CommonModule,
		AdminRoutingModule,

		HttpClientModule,

		MatButtonModule,
		MatProgressSpinnerModule
	],
	providers: []
})
export class AdminModule { }
