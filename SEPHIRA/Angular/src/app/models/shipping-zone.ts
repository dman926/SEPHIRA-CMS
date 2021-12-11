export interface ShippingZone {
	id?: string;
	applicableStates?: string[];
	rates?: {
		rate: number;
		type: string;
		minCutoff: number;
		maxCutoff: number;
	}[];
	default?: boolean;
}
