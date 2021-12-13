import { Product } from "./posts/product";

export interface Order {
	id?: string;
	orderStatus?: string;
	orderer?: string;
	products: Product[];
	addresses: AddressForm;
}

export interface AddressForm {
	billing: {
		city?: string;
		country?: string;
		name?: string;
		phoneNumber?: string;
		region?: string;
		street1?: string;
		street2?: string;
		zip?: string;
	};
	shipping: {
		city?: string;
		country?: string;
		name?: string;
		phoneNumber?: string;
		region?: string;
		street1?: string;
		street2?: string;
		zip?: string;
	};
}