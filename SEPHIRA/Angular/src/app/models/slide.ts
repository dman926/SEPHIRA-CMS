export interface Slide {
	/** The background image */
	backgroundImage: string;
	/** The image that appears */
	frontImage?: string;
	/** An object holding the hero text */
	heroText?: {
		/** The top text */
		top: string;
		/** The bottm text */
		bottom: string;
		/** The color of the text */
		color: string;
		/** Optional button for in-site navigation */
		button?: {
			/** The in-site URL to redirect to */
			page: string;
			/** The text of the button */
			text: string;
		}
	},
	/** The text that appears in the slide navigator */
	bottomText?: {
		/** The text of the navigation button */
		heroText: string;
		/** The color of the progress bar when slide is selected  */
		baseColor: string;
		/** The color of the progress bar when slide is not selected */
		selectedColor: string;
	}
}
