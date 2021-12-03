import { Component, Input } from '@angular/core';
import { MenuItem } from 'src/app/models/menu-item';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
	
	@Input() menuItems: MenuItem[];
	@Input() horizontal: boolean;

	constructor() {
		this.menuItems = [];
		this.horizontal = false;
	}

	dummy(): void { }

}
