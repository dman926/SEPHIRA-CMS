import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class SpeechSynthesisService {
	private speechSynthesizer: SpeechSynthesisUtterance;

	constructor() {
		this.speechSynthesizer = new SpeechSynthesisUtterance();
		this.speechSynthesizer.volume = 1;
		this.speechSynthesizer.rate = 1;
		this.speechSynthesizer.pitch = 1;
	}

	public speak(message: string): void {
		this.speechSynthesizer.lang = 'en-US';
		this.speechSynthesizer.text = message;
		speechSynthesis.speak(this.speechSynthesizer);
	}
}
