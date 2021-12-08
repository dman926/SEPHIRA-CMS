import { CartItem } from "./cart-item";

export interface User {
	email?: string;
	twoFactorEnabled?: boolean;
	admin?: boolean;
	firstName?: string;
	lastName?: string;
	cart: CartItem[];
}
