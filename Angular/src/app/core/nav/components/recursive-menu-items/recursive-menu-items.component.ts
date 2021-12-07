import { Component, Input, ViewChild } from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import { MenuItem } from 'src/app/models/menu-item';

@Component({
	selector: 'app-recursive-menu-items',
	templateUrl: './recursive-menu-items.component.html',
	styleUrls: ['./recursive-menu-items.component.scss'],
})
export class RecursiveMenuItemsComponent {
	
	@Input() items: MenuItem[];
	@ViewChild('menu', { static: true }) menu: MatMenu | undefined;

	constructor() {
		this.items = [];
	}

}
