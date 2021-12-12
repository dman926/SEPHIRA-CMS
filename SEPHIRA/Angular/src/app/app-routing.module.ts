import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from './admin/guards/admin.guard';
import { SignedInGuard } from './features/auth/guards/signed-in.guard';
import { SignedOutGuard } from './features/auth/guards/signed-out.guard';

const routes: Routes = [
	{
		path: 'admin',
		loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
		canActivate: [SignedInGuard, AdminGuard]
	},
	{
		path: 'login',
		loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
		canActivate: [SignedOutGuard]
	},
	{
		path: 'settings',
		loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsModule),
		canActivate: [SignedInGuard]
	},
	{
		path: 'shop',
		loadChildren: () => import('./features/shop/shop.module').then(m => m.ShopModule)
	},
	{
		path: '**',
		loadChildren: () => import('./features/page/page.module').then(m => m.PageModule)
	}
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, {
			initialNavigation: 'enabledBlocking',
		}),
	],
	exports: [RouterModule],
})
export class AppRoutingModule {}
