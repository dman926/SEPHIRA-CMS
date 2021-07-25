import { CartItem } from "./cart-item";

export interface User {
	id?: string;
	email?: string;
	twoFactorEnabled?: boolean;
	admin?: boolean;
	firstName?: string;
	lastName?: string;
	cart?: CartItem[];
}
