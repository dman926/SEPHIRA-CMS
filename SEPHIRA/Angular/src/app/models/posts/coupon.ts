import { Post } from "./post";

export interface Coupon extends Post {
	/** The coupon code */
	code?: string;
	/** The discount type */
	discountType?: 'percent' | 'dollar';
	/** The discount amount. Can be represented as a percent or a fixed dollar amount */
	discount?: number;
	/** If this coupon applies to all products */
	storeWide?: boolean;
	/** Products that must be in the cart for the discount to apply. Not applicable when `storeWide=true` */
	applicableProducts?: string[];
	/** The total number of uses */
	uses?: number;
	/** The max amount of uses */
	maxUses?: number;
}
