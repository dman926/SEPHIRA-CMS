import { Post } from "./post";

export interface Product extends Post {
	/** Optional SKU of the product. Used mainly for inventory. Don't expect this to be set. */
	sku?: string;
	/** An array of Object IDs of associated Media files. Should only be images */
	img?: string[];
	/** The price of the product */
	price?: number;
	/** If the product's stock is a factor */
	hasStock?: boolean;
	/** The products current stock. Only used if `hasStock` is `true` */
	stock?: number;
	/** The total number of reviews */
	totalReviews?: number;
	/** The average review score */
	avgReviewScore?: number;
}
