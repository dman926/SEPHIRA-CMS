import { Card } from './card';

export interface User {
	id?: string;
	email?: string;
	twoFactorEnabled?: boolean;
	admin?: boolean;
	firstName?: string;
	lastName?: string;
}
