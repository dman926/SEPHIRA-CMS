import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersRoutingModule } from './users-routing.module';
import { UsersComponent } from './users/users.component';
import { UserComponent } from './user/user.component';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
	declarations: [
		UsersComponent,
  UserComponent
	],
	imports: [
		CommonModule,
		UsersRoutingModule,

		MatPaginatorModule,
		MatButtonModule,
		MatCardModule,
		MatProgressSpinnerModule
	]
})
export class UsersModule { }
