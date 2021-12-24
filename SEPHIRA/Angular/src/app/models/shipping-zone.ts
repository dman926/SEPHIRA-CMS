export interface ShippingZone {
	/** Object ID of this `ShippingZone` */
	id?: string;
	/** States the `ShippingZone` is applicable to */
	applicableStates?: string[];
	/** An array of `Rates` */
	rates?: ShippingRate[];
	/** If this is the default `ShippingZone` */
	default?: boolean;
}

export interface ShippingRate {
	/** The rate. Can be represented as a percent or a constant price */
	rate: number;
	/** The type of the rate. Can be 'percent' or 'dollar' */
	type: 'percent' | 'dollar';
	/** The minimum price needed for the rate to take affect */
	minCutoff?: number;
	/** The maximum price needed for the rate to take affect */
	maxCutoff?: number;
}