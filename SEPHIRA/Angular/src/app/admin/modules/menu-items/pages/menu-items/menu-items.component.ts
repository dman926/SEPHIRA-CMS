import { Component, OnInit } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { AdminService } from 'src/app/admin/servies/admin.service';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { MenuItem } from 'src/app/models/menu-item';

@Component({
	selector: 'app-menu-items',
	templateUrl: './menu-items.component.html',
	styleUrls: ['./menu-items.component.scss'],
})
export class MenuItemsComponent implements OnInit {

	menuItems: MenuItem[];

	constructor(private admin: AdminService, private platform: PlatformService, private state: TransferState) {
		this.menuItems = [];
	}

	ngOnInit(): void {
		const stateKey = makeStateKey<MenuItem[]>('menuItems');
		if (this.platform.isServer) {
			this.admin.getMenuItems().subscribe(items => {
				this.menuItems = items;
				this.state.set(stateKey, items);
			});
		} else {
			const items = this.state.get(stateKey, null);
			if (items) {
				this.menuItems = items;				
			} else {
				this.admin.getMenuItems().subscribe(items => {
					this.menuItems = items;
				});
			}
		}
	}

	saveTree(): void {
		this.admin.saveMenuItems(this.menuItems).subscribe(res => {
			// TODO: notify user of successful save and notify `nav` to refresh menu items
		});
	}

	addTopLevel(): void {
		this.menuItems.push({
			text: 'TEXT HERE',
			link: '/LINK-HERE',
			children: []
		});
	}

	removeTopLevel(): void {
		this.menuItems.pop();
	}

	addChildNode(node: MenuItem): void {
		if (!node.children) {
			// Shouldn't happen, but just in case
			node.children = [];
		}
		node.children.push({
			text: 'TEXT HERE',
			link: '/LINK-HERE',
			children: []
		});
	}

	removeNode(node: MenuItem): void {
		if (!node.children) {
			// Shouldn't happen, but just in case
			node.children = [];
		}
		node.children.pop();
	}

	editNodeText(node: MenuItem, event: any): void {
		node.text = event.target.value;
	}

	editNodeLink(node: MenuItem, event: any): void {
		node.link = event.target.value;
	}

}
