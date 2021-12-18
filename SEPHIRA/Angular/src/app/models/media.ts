export interface Media {
	id?: string;
	owner: string;
	folder: string;
	filename: string;
	size?: number;
	dir?: boolean;
	mimetype?: string;
	associatedMedia?: AssociatedMedia[];
}

export interface AssociatedMedia {
	id: string;
	owner: string;
	folder: string;
	filename: string;
	size: number;
	mimetype: string;
}
