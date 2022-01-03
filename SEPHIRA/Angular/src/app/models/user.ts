import { CartItem } from "./cart-item";

export interface User {
	/** Email address. Must be unique */
	email?: string;
	/** If the email is verified */
	verified?: boolean;
	/** If two factor authentication is enabled */
	twoFactorEnabled?: boolean;
	/** Is the `User` an admin */
	admin?: boolean;
	/** The `User`'s first name */
	firstName?: string;
	/** The `User`'s last name */
	lastName?: string;
	/** The `User`'s cart */
	cart?: CartItem[];
}
