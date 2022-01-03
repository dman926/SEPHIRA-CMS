import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth.component';
import { RedirectComponent } from './pages/redirect/redirect.component';
import { ResetComponent } from './pages/reset/reset.component';

const routes: Routes = [
	{
		path: '',
		component: AuthComponent
	},
	{
		path: 'reset',
		component: ResetComponent
	},
	{
		path: 'redirect',
		component: RedirectComponent
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
