import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from './nav/nav.component';
import { HttpClientModule } from '@angular/common/http';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { RecursiveMenuItemsComponent } from './recursive-menu-items/recursive-menu-items.component';
import { MenuComponent } from './menu/menu.component';

@NgModule({
	declarations: [
		NavComponent,
  RecursiveMenuItemsComponent,
  MenuComponent
	],
	imports: [
		CommonModule,
		RouterModule,
		HttpClientModule,

		MatToolbarModule,
		MatSidenavModule,
		MatIconModule,
		MatButtonModule,
		MatMenuModule,
		MatListModule
	],
	exports: [
		NavComponent
	]
})
export class NavModule {}
