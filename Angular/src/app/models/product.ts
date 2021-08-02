import { Post } from "./post";

export interface Product extends Post {
	sku?: string;
	img?: string[];
	price?: number;
	hasStock?: boolean;
	stock?: number;
	totalReviews?: number;
	avgReviewScore?: number;
}
