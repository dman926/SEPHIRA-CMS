export interface Review {
	/** Object ID of this `Review` */
	id?: string;
	/** Information on the reviewer */
	reviewer?: { firstName: string };
	/** The product the review is for */
	product?: string;
	/** The score of the review */
	score?: number;
	/** Optional review text */
	review?: string;
}
