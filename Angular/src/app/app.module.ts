import { NgModule } from '@angular/core';
import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from './core/core.module';
import { CookieModule } from 'ngx-cookie';
import { environment } from 'src/environments/environment';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from "ng-recaptcha";
import { ServiceWorkerModule } from '@angular/service-worker';

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

		RecaptchaV3Module,
		CoreModule,
  ServiceWorkerModule.register('ngsw-worker.js', {
    enabled: environment.production,
    // Register the ServiceWorker as soon as the app is stable
    // or after 30 seconds (whichever comes first).
    registrationStrategy: 'registerWhenStable:30000'
  })
	],
	providers: [
		{ provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.recaptchaSiteKey },
		{ provide: 'googleTagManagerId', useValue: environment.gtmId }
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
