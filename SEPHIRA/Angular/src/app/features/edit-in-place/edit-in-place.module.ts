import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditInPlaceComponent } from './components/edit-in-place/edit-in-place.component';
import { EditModeDirective } from './directives/edit-mode.directive';
import { ViewModeDirective } from './directives/view-mode.directive';



@NgModule({
	declarations: [
		EditInPlaceComponent,
		EditModeDirective,
		ViewModeDirective
	],
	imports: [
		CommonModule
	],
	exports: [
		EditInPlaceComponent,
		EditModeDirective,
		ViewModeDirective
	]
})
export class EditInPlaceModule { }
