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
	/** Is this media actually a container for private media */
	container?: boolean;
	/** The content type */
	mimetype?: string;
	/** Metadata for the file. Depends on the mimetype, so check the object for valid fields */
	metadata?: Metadata;
	/** If the media is still processing */
	readonly processing?: boolean;
	/** The processing percent done */
	percentDone?: number;
	/** If the media is private (ex. an audio component of a video) */
	readonly private?: boolean;
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

export interface Metadata {
	/** If text. The kind of text for video track */
	textKind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
	/** If text. The kind of audio for video track */
	audioKind?: 'alternative' | 'descriptions' | 'main' | 'main-desc' | 'translation' | 'commentary';
	/** If text. The mode of text for video track */
	mode?: 'disabled' | 'hidden' | 'showing';
	/** If text. The source language for video track */
	srclang?: string;
	/** If text. The label for video track */
	label?: string;
	/** If text. If the default track */
	default?: boolean;
}