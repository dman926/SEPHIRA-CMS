export interface CartItem {
	/** Object ID of this `CartItem` */
	id: string;
	/** The name of the product */
	name: string;
	/** The price of the product */
	price: number;
	/** The slug of the product */
	slug?: string;
	/** The main image of the product */
	img?: string;
	/** The quantity of products */
	qty: number;
}
