export interface ShippingZone {
	id?: string;
	applicableStates?: string[];
	rates?: ShippingRate[];
	default?: boolean;
}

export interface ShippingRate {
	rate: number;
	type: string;
	minCutoff: number;
	maxCutoff: number;
}