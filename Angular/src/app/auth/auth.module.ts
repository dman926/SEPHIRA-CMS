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
import { MyAccountComponent } from './my-account/my-account.component';
import { AuthService } from './auth.service';
import { OtpDialogComponent } from './login/otp-dialog/otp-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';


@NgModule({
	declarations: [LoginComponent, MyAccountComponent, OtpDialogComponent],
	imports: [
		CommonModule,
		AuthRoutingModule,
		ReactiveFormsModule,
		HttpClientModule,

		MatFormFieldModule,
		MatInputModule,
		MatIconModule,
		MatButtonModule,
		MatDialogModule
	],
	providers: [
		AuthService
	],
	exports: [
		LoginComponent
	]
})
export class AuthModule { }
