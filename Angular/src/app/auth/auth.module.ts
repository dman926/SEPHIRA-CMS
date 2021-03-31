import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { AuthService } from './auth.service';


@NgModule({
	declarations: [LoginComponent, RegisterComponent, MyAccountComponent],
	imports: [
		CommonModule,
		AuthRoutingModule,
		ReactiveFormsModule,
		HttpClientModule,

		MatFormFieldModule,
		MatInputModule,
		MatIconModule,
		MatButtonModule
	],
	providers: [
		AuthService
	],
	exports: [
		LoginComponent,
		RegisterComponent
	]
})
export class AuthModule { }
