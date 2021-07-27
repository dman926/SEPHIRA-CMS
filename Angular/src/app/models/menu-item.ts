export interface MenuItem {
	text: string;
	link: string;
	order?: number;
	children: MenuItem[];
}
