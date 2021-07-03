import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageComponent } from './page/page.component';
import { PagesComponent } from './pages/pages.component';

const routes: Routes = [
	{
		path: '',
		component: PagesComponent
	},
	{
		path: ':id',
		component: PageComponent
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
