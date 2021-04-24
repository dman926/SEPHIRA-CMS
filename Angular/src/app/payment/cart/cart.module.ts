import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthModule } from 'src/app/auth/auth.module';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';

import { CartRoutingModule } from './cart-routing.module';
import { CartComponent } from './cart/cart.component';
import { CartService } from './cart.service';


@NgModule({
	declarations: [
		CartComponent
	],
	imports: [
		CommonModule,
		CartRoutingModule,

		AuthModule,

		MatButtonModule,
		MatIconModule,
		MatMenuModule,
		MatBadgeModule
	],
	providers: [
		CartService
	],
	exports: [
		CartComponent
	]
})
export class CartModule { }
