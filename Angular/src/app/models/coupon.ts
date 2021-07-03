import { Post } from "./post";

export interface Coupon extends Post {
	code: string;
	discountType: string;
	discount: number;
	owningVendor?: string;
	uses?: number;
	adminCoupon?: boolean;
	created?: Date;
}
