import { Post } from "./post";

export interface Coupon extends Post {
	code?: string;
	discountType?: string;
	discount?: number;
	storeWide?: boolean;
	applicableProducts?: string[];
	uses?: number;
	maxUses?: number;
}
