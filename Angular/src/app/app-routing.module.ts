import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from './admin/admin.guard';
import { AuthGuard } from './auth/auth.guard';
import { SwaggerComponent } from './core/swagger/swagger.component';

const routes: Routes = [
	{
		path: 'swagger',
		component: SwaggerComponent
	},
	{
		path: 'checkout',
		loadChildren: () => import('./payment/checkout/checkout.module').then(m => m.CheckoutModule)
	},
	{
		path: 'shop',
		loadChildren: () => import('./shop/shop.module').then(m => m.ShopModule)
	},
	{
		path: 'search',
		loadChildren: () => import('./search/search.module').then(m => m.SearchModule)
	},
	{
		path: 'settings',
		loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule),
		canActivate: [AuthGuard]
	},
	{
		path: 'dashboard',
		loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
		canActivate: [AuthGuard]
	},
	{
		path: 'admin',
		loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
		canActivate: [AuthGuard, AdminGuard]
	},
	{
		path: '**',
		loadChildren: () => import('./page/page.module').then(m => m.PageModule)
	}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabled'
})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
