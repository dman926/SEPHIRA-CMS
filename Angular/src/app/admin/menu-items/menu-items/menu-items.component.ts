import { Component, OnInit } from '@angular/core';
import { PlatformService } from 'src/app/core/services/platform.service';
import { MenuItem } from 'src/app/models/menu-item';
import { AdminService } from '../../admin.service';

@Component({
	selector: 'app-menu-items',
	templateUrl: './menu-items.component.html',
	styleUrls: ['./menu-items.component.scss']
})
export class MenuItemsComponent implements OnInit {

	menuItems: MenuItem[];

	saved: boolean;

	constructor(private admin: AdminService, private platformService: PlatformService) {
		this.menuItems = [];
		this.saved = false;
	}

	ngOnInit(): void {
		if (this.platformService.isBrowser()) {
			this.admin.getMenuItems().toPromise().then(items => {
				this.menuItems = items;
			});
		}
	}

	saveTree(): void {
		this.admin.saveMenuItems(this.menuItems).toPromise().then(res => {
			this.saved = true;
			setTimeout(() => this.saved = false, 3000);
		});
	}

	addTopLevel(): void {
		this.menuItems.push({
			text: '',
			link: '/',
			children: [],
			order: this.menuItems.length
		});
	}

	removeTopLevel(): void {
		this.menuItems.pop();
	}

	addChildNode(node: MenuItem): void {
		node.children.push({
			text: '',
			link: '/',
			children: []
		});
	}

	removeNode(node: MenuItem): void {
		node.children.pop();
	}

	editNodeText(node: MenuItem, event: any): void {
		node.text = event.target.value;
	}

	editNodeLink(node: MenuItem, event: any): void {
		node.link = event.target.value;
	}

}
