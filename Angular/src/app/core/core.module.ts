import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { HttpClientModule } from '@angular/common/http';

import { NavComponent } from './nav/nav.component';
import { LayoutModule } from '@angular/cdk/layout';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { LandingComponent } from './landing/landing.component';
import { AuthModule } from '../auth/auth.module';
import { FileService } from './services/file.service';
import { WebsocketService } from './services/websocket.service';



@NgModule({
	declarations: [NavComponent, LandingComponent],
	imports: [
		CommonModule,
		RouterModule,
		LayoutModule,

		HttpClientModule,

		AuthModule,

		MatToolbarModule,
		MatButtonModule,
		MatSidenavModule,
		MatIconModule,
		MatListModule
	],
	providers: [
		FileService,
		WebsocketService
	],
	exports: [
		NavComponent
	]
})
export class CoreModule { }
