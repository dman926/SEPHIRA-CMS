import { Product } from "./product";

export interface User {
	id?: string;
	email?: string;
	admin?: boolean;
	cart: Product[];
}
