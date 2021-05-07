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

import { LandingComponent } from './landing/landing.component';
import { AuthModule } from '../auth/auth.module';
import { FileService } from './services/file.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { SwaggerComponent } from './swagger/swagger.component';
import { WebsocketService } from './services/websocket.service';
import { RecaptchaV3Module, RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha';



@NgModule({
	declarations: [NavComponent, LandingComponent, SwaggerComponent],
	imports: [
		CommonModule,
		RouterModule,
		LayoutModule,

		ReactiveFormsModule,
		HttpClientModule,

		RecaptchaV3Module,

		AuthModule,

		MatToolbarModule,
		MatButtonModule,
		MatSidenavModule,
		MatIconModule,
		MatListModule,
		MatFormFieldModule,
		MatInputModule
	],
	providers: [
		{
			provide: RECAPTCHA_V3_SITE_KEY,
			useValue: '6LfH28kaAAAAADGa7FNCdPCcrJoZCDm8qdVVsK9j'
		},

		FileService,
		WebsocketService
	],
	exports: [
		NavComponent
	]
})
export class CoreModule { }
