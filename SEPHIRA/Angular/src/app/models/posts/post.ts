import { SafeHtml } from "@angular/platform-browser";

export interface Post {
	/** Object ID of this `Post` */
	id?: string
	/** Information on the author of the post */
	author?: {
		/** Object ID of the author */
		id: string,
		/** The first name of the author */
		firstName: string;
		/** The last name of the author */
		lastName: string;
	},
	/** The title of the post */
	title?: string;
	/** The slug of the post */
	slug?: string;
	/** The content of the post. Arrives as a `string` and is converted to `SafeHtml` with the use of `DomSanitizer` */
	content?: string | SafeHtml;
	/** The excerpt of the post. Mostly used for the search page to safely and easily display the content in a short form */
	excerpt?: string;
	/** The status of the post */
	status?: 'publish' | 'draft' | 'private' | 'deactivated';
	/** Categories of the post. Mainly used to aid searching */
	categories?: string[];
	/** The date the post was created */
	created?: Date;
	/** The date the post was last modified */
	modified?: Date;
}

export interface PostSchema {
	/** The name of the field */
	name: string,
	/** The nice name of the field for displaying */
	niceName: string,
	/** The control type */
	controlType: 'input' | 'wysiwyg' | 'textarea' | 'select' | 'FormArray' | 'media-browser' | 'checkbox' | 'post-select';
	/** The type property of the control type. (ex. an `input` may have `type='number'`) */
	type?: string;
	/** If multiple are allowed. Only applies if `controlType` is `media-browser` or `post-select` */
	multiple?: boolean;
	/** Validators for the underlying `FormControl` or `FormArray` */
	validators?: {
		/** If a value of underlying `FormControl` or `FormArray` is required */
		required?: boolean;
		/** A REGEX validator for the underlying `FormControl` or `FormArray` */
		pattern?: string;
	};
	/** Options for a select menu. Only applies when `controlType='select'` */
	options?: {
		/** The nice name to be displayed */
		key: string;
		/** The value for the `FormControl` */
		value: string;
	}[];
	/** The `PostSchema` for the `FormCotrol` of a `FormArray`. Only applies when `controlType='FormArray`` */
	array?: PostSchema;
}
