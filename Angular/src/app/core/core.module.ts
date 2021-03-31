import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { NavComponent } from './nav/nav.component';
import { LayoutModule } from '@angular/cdk/layout';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { LandingComponent } from './landing/landing.component';
import { AuthModule } from '../auth/auth.module';



@NgModule({
	declarations: [NavComponent, LandingComponent],
	imports: [
		CommonModule,
		RouterModule,
		LayoutModule,

		AuthModule,

		MatToolbarModule,
		MatButtonModule,
		MatSidenavModule,
		MatIconModule,
		MatListModule
	],
	exports: [
		NavComponent
	]
})
export class CoreModule { }
