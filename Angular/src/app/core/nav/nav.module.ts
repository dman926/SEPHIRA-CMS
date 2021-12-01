import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from './nav/nav.component';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
	declarations: [
		NavComponent
	],
	imports: [
		CommonModule,

		MatToolbarModule,
		MatSidenavModule,
		MatIconModule,
		MatButtonModule
	],
	exports: [
		NavComponent
	]
})
export class NavModule {}
