import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuItemsComponent } from './pages/menu-items/menu-items.component';

const routes: Routes = [
	{
		path: '',
		component: MenuItemsComponent
	}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MenuItemsRoutingModule { }
