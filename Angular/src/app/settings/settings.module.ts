import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings/settings.component';

import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
	declarations: [SettingsComponent],
	imports: [
		CommonModule,
		SettingsRoutingModule,

		ReactiveFormsModule,
		NgxQRCodeModule,

		MatButtonModule,
		MatFormFieldModule,
		MatInputModule
	]
})
export class SettingsModule { }
