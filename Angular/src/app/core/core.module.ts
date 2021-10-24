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

import { AuthModule } from '../auth/auth.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { SwaggerComponent } from './swagger/swagger.component';
import { MatCardModule } from '@angular/material/card';
import { CartModule } from '../payment/cart/cart.module';
import { SearchModule } from '../search/search.module';



@NgModule({
	declarations: [NavComponent, SwaggerComponent],
	imports: [
		CommonModule,
		RouterModule,
		LayoutModule,

		ReactiveFormsModule,
		HttpClientModule,

		AuthModule,
		CartModule,
		SearchModule,

		MatToolbarModule,
		MatButtonModule,
		MatSidenavModule,
		MatIconModule,
		MatListModule,
		MatFormFieldModule,
		MatInputModule,
		MatCardModule
	],
	exports: [
		NavComponent
	]
})
export class CoreModule { }
