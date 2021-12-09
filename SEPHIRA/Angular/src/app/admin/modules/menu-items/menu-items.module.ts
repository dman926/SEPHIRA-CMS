import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenuItemsRoutingModule } from './menu-items-routing.module';
import { MenuItemsComponent } from './pages/menu-items/menu-items.component';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { EditInPlaceModule } from 'src/app/features/edit-in-place/edit-in-place.module';


@NgModule({
	declarations: [
		MenuItemsComponent
	],
	imports: [
		CommonModule,
		MenuItemsRoutingModule,

		MatTreeModule,
		MatButtonModule,
		MatIconModule,

		EditInPlaceModule
	]
})
export class MenuItemsModule { }
