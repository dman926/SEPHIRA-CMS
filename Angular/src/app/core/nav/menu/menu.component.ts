import { Component, Input } from '@angular/core';
import { MenuItem } from 'src/app/models/menu-item';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
	
	@Input() menuItems: MenuItem[];
	@Input() horizontal: boolean;
	@Input() isAdmin: boolean;

	readonly adminPath: string = environment.adminPath;

	constructor() {
		this.menuItems = [];
		this.horizontal = false;
		this.isAdmin = false;
	}

}
