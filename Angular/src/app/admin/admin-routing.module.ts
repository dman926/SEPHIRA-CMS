import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
	{
		path: '',
		component: HomeComponent
	},
	{
		path: 'users',
		loadChildren: () => import('./users/users.module').then(m => m.UsersModule)
	},
	{
		path: 'pages',
		loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule)
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
