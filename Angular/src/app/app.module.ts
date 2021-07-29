import { NgModule } from '@angular/core';
import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from './core/core.module';
import { CookieModule } from 'ngx-cookie';
import { environment } from 'src/environments/environment';

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		BrowserModule.withServerTransition({ appId: 'serverApp' }),
		AppRoutingModule,
		BrowserAnimationsModule,
		BrowserTransferStateModule,
		CookieModule.forRoot(),

		CoreModule
	],
	providers: [
		{ provide: 'googleTagManagerId', useValue: environment.gtmId }
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
