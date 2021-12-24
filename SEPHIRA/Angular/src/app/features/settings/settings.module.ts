import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './pages/settings/settings.component';
import { ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { QrCodeModule } from 'ng-qrcode';
import { TwoFaDialogComponent } from './components/two-fa-dialog/two-fa-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';


@NgModule({
	declarations: [
		SettingsComponent,
  TwoFaDialogComponent
	],
	imports: [
		CommonModule,
		SettingsRoutingModule,
		ReactiveFormsModule,

		MatButtonModule,
		MatFormFieldModule,
		MatInputModule,
		MatSlideToggleModule,
		MatDialogModule,

		QrCodeModule
	]
})
export class SettingsModule { }
