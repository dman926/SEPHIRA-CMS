export interface Media {
	id?: string;
	owner: string;
	folder: string;
	filename: string;
	size?: number;
	dir?: boolean;
	mimetype?: string;
	associatedMeda?: string[];
}
