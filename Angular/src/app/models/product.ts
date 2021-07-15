import { Post } from "./post";

export interface Product extends Post {
	sku?: string;
	img?: string[];
	price?: number;
	totalReviews?: number;
	avgReviewScore?: number;
}
