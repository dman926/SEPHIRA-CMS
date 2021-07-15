import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { HomeComponent } from './home/home.component';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from './admin.service';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
	declarations: [
		HomeComponent
	],
	imports: [
		CommonModule,
		AdminRoutingModule,

		HttpClientModule,

		MatButtonModule,
		MatProgressSpinnerModule
	],
	providers: [AdminService]
})
export class AdminModule { }
