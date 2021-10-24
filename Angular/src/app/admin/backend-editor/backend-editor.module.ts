import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BackendEditorRoutingModule } from './backend-editor-routing.module';
import { BackendEditorComponent } from './backend-editor/backend-editor.component';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@NgModule({
	declarations: [
		BackendEditorComponent
	],
	imports: [
		CommonModule,
		BackendEditorRoutingModule,

		ReactiveFormsModule,

		MatIconModule,
		MatButtonModule,
		MatInputModule,
		MatFormFieldModule,
		MatProgressSpinnerModule
	]
})
export class BackendEditorModule { }
