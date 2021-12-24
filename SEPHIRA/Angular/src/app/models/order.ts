import { Product } from "./posts/product";

export interface Order {
	/** Object ID of this `Order` */
	id?: string;
	/** The status of the order */
	orderStatus?: 'not placed' | 'pending' | 'paid' | 'shipped' | 'completed' | 'failed';
	/** Object ID of the ordering `User` */
	orderer?: string;
	/** The list of products included in the order */
	products: Product[];
	/** An object containing billing and shipping information */
	addresses: AddressForm;
}

export interface AddressForm {
	/** Billing information */
	billing: {
		/** The billing city */
		city?: string;
		/** the billing country */
		country?: string;
		/** The billing name */
		name?: string;
		/** The billing phone number */
		phoneNumber?: string;
		/** The billing region/state/providence */
		region?: string;
		/** The billing street address */
		street1?: string;
		/** The billing sub-street address (ex. apt number) */
		street2?: string;
		/** The billing postal code */
		zip?: string;
	};
	shipping: {
		/** The shipping city */
		city?: string;
		/** The shipping country */
		country?: string;
		/** The shipping name */
		name?: string;
		/** The shipping phone number */
		phoneNumber?: string;
		/** The shipping region/state/ */
		region?: string;
		/** The shipping street address */
		street1?: string;
		/** The shipping sub-street address (ex. apt number) */
		street2?: string;
		/** The shipping postal code */
		zip?: string;
	};
}