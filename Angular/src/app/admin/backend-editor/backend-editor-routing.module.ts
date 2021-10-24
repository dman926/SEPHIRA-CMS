import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BackendEditorComponent } from './backend-editor/backend-editor.component';

const routes: Routes = [
	{
		path: '',
		component: BackendEditorComponent
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BackendEditorRoutingModule { }
