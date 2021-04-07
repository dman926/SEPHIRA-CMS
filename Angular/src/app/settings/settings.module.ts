import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings/settings.component';

import { MatButtonModule } from '@angular/material/button';


@NgModule({
	declarations: [SettingsComponent],
	imports: [
		CommonModule,
		SettingsRoutingModule,

		MatButtonModule
	]
})
export class SettingsModule { }
