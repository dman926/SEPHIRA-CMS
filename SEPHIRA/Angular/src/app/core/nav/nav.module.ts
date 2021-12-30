import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { NavComponent } from './components/nav/nav.component';
import { RecursiveMenuItemsComponent } from './components/recursive-menu-items/recursive-menu-items.component';
import { MenuComponent } from './components/menu/menu.component';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ShopModule } from 'src/app/features/shop/shop.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';


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
		MatListModule,
		MatSnackBarModule,
		MatSlideToggleModule,

		ShopModule
	],
	exports: [
		NavComponent
	]
})
export class NavModule {}
