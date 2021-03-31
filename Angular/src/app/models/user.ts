export interface User {
	id?: { $oid?: string };
	username?: string;
	password?: string;
}
