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
		path: 'posts',
		loadChildren: () => import('./posts/posts.module').then(m => m.PostsModule)
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
