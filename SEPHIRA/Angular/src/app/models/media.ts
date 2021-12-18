export interface Media {
	/** Object ID of this `Media` */
	id?: string;
	/** ID of owning `User` */
	owner: string;
	/** Folder file belongs to */
	folder: string;
	/** File name. Must be unique with `folder` */
	filename: string;
	/** Size of file in bytes */
	size?: number;
	/** Is this media actually a folder */
	dir?: boolean;
	/** The content type */
	mimetype?: string;
	/** Child `Media` */
	associatedMedia?: AssociatedMedia[];
}

export interface AssociatedMedia {
	/** Object ID of this `Media` */
	id: string;
	/** ID of owning `User` */
	owner: string;
	/** Folder file belongs to */
	folder: string;
	/** File name. Must be unique with `folder` */
	filename: string;
	/** Size of file in bytes */
	size: number;
	/** The content type */
	mimetype: string;
}
