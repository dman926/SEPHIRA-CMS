import { Card } from "./card";

export interface User {
	id?: string;
	email?: string;
	admin?: boolean;
	cards?: Card[];
}
