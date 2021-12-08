import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './home-routing.module';

import { HomeComponent } from './pages/home/home.component';

import { MatButtonModule } from '@angular/material/button';


@NgModule({
	declarations: [
		HomeComponent
	],
	imports: [
		CommonModule,
		AdminRoutingModule,

		MatButtonModule
	]
})
export class AdminModule { }
