export interface Post {
	id?: string;
	title?: string;
	slug?: string;
	status?: string;
}

export interface PostSchema {
	name: string,
	niceName: string,
	controlType: string;
	type?: string;
	multiple?: boolean;
	validators?: {
		required?: boolean;
		pattern?: string;
	};
	options?: {
		key: string;
		value: string;
	}[];
	array?: PostSchema;
}
