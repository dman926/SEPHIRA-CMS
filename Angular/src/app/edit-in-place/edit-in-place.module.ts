import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditInPlaceComponent } from './edit-in-place/edit-in-place.component';
import { ViewModeDirective } from './view-mode.directive';
import { EditModeDirective } from './edit-mode.directive';



@NgModule({
	declarations: [
		EditInPlaceComponent,
		ViewModeDirective,
		EditModeDirective
	],
	imports: [
		CommonModule
	],
	exports: [
		EditInPlaceComponent,
		ViewModeDirective,
		EditModeDirective
	]
})
export class EditInPlaceModule { }
