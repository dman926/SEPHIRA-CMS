import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
	{
		path: '',
		component: HomeComponent
	},
	{
		path: 'backend-editor',
		loadChildren: () => import('./backend-editor/backend-editor.module').then(m => m.BackendEditorModule)
	},
	{
		path: 'users',
		loadChildren: () => import('./users/users.module').then(m => m.UsersModule)
	},
	{
		path: 'orders',
		loadChildren: () => import('./orders/orders.module').then(m => m.OrdersModule)
	},
	{
		path: 'shipping-zones',
		loadChildren: () => import('./shipping-zones/shipping-zones.module').then(m => m.ShippingZonesModule)
	},
	{
		path: 'menu-items',
		loadChildren: () => import('./menu-items/menu-items.module').then(m => m.MenuItemsModule)
	},
	{
		path: ':postType',
		loadChildren: () => import('./post/post.module').then(m => m.PostModule)
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
