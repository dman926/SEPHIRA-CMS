export interface User {
	id?: { $oid?: string };
	email?: string;
	password?: string;
	admin?: boolean;
	cards?: any[];
}
