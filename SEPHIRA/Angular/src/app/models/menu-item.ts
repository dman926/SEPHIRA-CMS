export interface MenuItem {
	/** The text of the menu item */
	text: string;
	/** The link of the menu item */
	link: string;
	/** Children of the menu item. Displayed in MatMenus */
	children?: MenuItem[];
}
