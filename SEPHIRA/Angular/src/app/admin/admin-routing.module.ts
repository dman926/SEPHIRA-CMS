import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		loadChildren: () => import('./modules/home/home.module').then(m => m.AdminModule)
	},
	{
		path: 'users',
		loadChildren: () => import('./modules/users/users.module').then(m => m.UsersModule)
	},
	{
		path: 'orders',
		loadChildren: () => import('./modules/orders/orders.module').then(m => m.OrdersModule)
	},
	{
		path: 'shipping-zones',
		loadChildren: () => import('./modules/shipping-zones/shipping-zones.module').then(m => m.ShippingZonesModule)
	},
	{
		path: 'menu-items',
		loadChildren: () => import('./modules/menu-items/menu-items.module').then(m => m.MenuItemsModule)
	},
	{
		path: 'media',
		loadChildren: () => import('./modules/media/media.module').then(m => m.MediaModule)
	},
	{
		path: ':postType',
		loadChildren: () => import('./modules/posts/posts.module').then(m => m.PostsModule)
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AdminRoutingModule { }
