export interface Slide {
	backgroundImage: string;
	frontImage?: string;
	heroText?: {
		top: string;
		bottom: string;
		color: string;
		button?: {
			page: string;
			text: string;
		}
	},
	bottomText?: {
		heroText: string;
		baseColor: string;
		selectedColor: string;
	}
}