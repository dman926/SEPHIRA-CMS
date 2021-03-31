export interface Card {
	_id?: { $oid?: string };
	name?: string;
	content?: string;
	width?: number;
	height?: number;
	owner?: { $oid?: string };
}
