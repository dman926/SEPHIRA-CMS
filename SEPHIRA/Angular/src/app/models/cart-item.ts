export interface CartItem {
	/** Object ID of this `CartItem` */
	id: string;
	/** The name of the product */
	name: string;
	/** The price of the product */
	price: number;
	/** The quantity of products */
	qty: number;
}
