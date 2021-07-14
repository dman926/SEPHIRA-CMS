export interface ShippingZone {
	applicableStates: string[];
	rates: {
		rate: number;
		type: string;
		minCutoff: number;
		maxCutoff: number;
	}[];
}
