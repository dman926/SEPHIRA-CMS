export interface Post {
	id?: string
	author?: {
		id: string,
		firstName: string;
		lastName: string;
	},
	title?: string;
	slug?: string;
	content?: string;
	excerpt?: string;
	status?: string;
	created?: Date;
	modified?: Date;
}
