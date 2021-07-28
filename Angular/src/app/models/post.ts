import { SafeHtml } from "@angular/platform-browser";

export interface Post {
	id?: string
	author?: {
		id: string,
		firstName: string;
		lastName: string;
	},
	title?: string;
	slug?: string;
	content?: string | SafeHtml;
	excerpt?: string;
	status?: string;
	categories?: string[];
	created?: Date;
	modified?: Date;
}
