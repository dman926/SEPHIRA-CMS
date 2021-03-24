import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './core/landing/landing.component';

const routes: Routes = [
	{
		path: '',
		component: LandingComponent
	},
	{
		path: 'auth',
		loadChildren: () => import('./core/auth/auth.module').then(m => m.AuthModule)
	}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
