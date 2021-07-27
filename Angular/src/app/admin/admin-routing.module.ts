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
	},
	{
		path: 'products',
		loadChildren: () => import('./products/products.module').then(m => m.ProductsModule)
	},
	{
		path: 'coupons',
		loadChildren: () => import('./coupons/coupons.module').then(m => m.CouponsModule)
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
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
