import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

import { SpeechError } from 'src/app/models/speech/speech-error';
import { SpeechEvent } from 'src/app/models/speech/speech-event';
import { SpeechNotification } from 'src/app/models/speech/speech-notification';
import { AppWindow } from 'src/app/models/app-window';

const { webkitSpeechRecognition }: AppWindow = (window as any) as AppWindow;

@Injectable({
	providedIn: 'root',
})
export class SpeechRecognitionService {
	recognition!: SpeechRecognition;
	isListening = false;

	constructor(private ngZone: NgZone) { }

	initialize(): boolean {
		if ('webkitSpeechRecognition' in window) {
			this.recognition = new webkitSpeechRecognition();
			this.recognition.continuous = true;
			this.recognition.interimResults = true;
			this.recognition.lang = 'en-US';
			return true;
		}

		return false;
	}

	start(): void {
		if (!this.recognition) {
			return;
		}

		this.recognition.start();
		this.isListening = true;
	}

	onStart(): Observable<SpeechNotification<never>> {
		if (!this.recognition) {
			this.initialize();
		}

		return new Observable(observer => {
			this.recognition.onstart = () => {
				this.ngZone.run(() => {
					observer.next({
						event: SpeechEvent.Start
					});
				});
			};
		});
	}

	onEnd(): Observable<SpeechNotification<never>> {
		return new Observable(observer => {
			this.recognition.onend = () => {
				this.ngZone.run(() => {
					observer.next({
						event: SpeechEvent.End
					});
					this.isListening = false;
				});
			};
		});
	}

	onResult(): Observable<SpeechNotification<string>> {
		return new Observable(observer => {
			this.recognition.onresult = (event: SpeechRecognitionEvent) => {
				let interimContent = '';
				let finalContent = '';

				for (let i = event.resultIndex; i < event.results.length; ++i) {
					if (event.results[i].isFinal) {
						finalContent += event.results[i][0].transcript;
						this.ngZone.run(() => {
							observer.next({
								event: SpeechEvent.FinalContent,
								content: finalContent
							});
						});
					} else {
						interimContent += event.results[i][0].transcript;
						// console.log('interim transcript', event, interimContent);
						this.ngZone.run(() => {
							observer.next({
								event: SpeechEvent.InterimContent,
								content: interimContent
							});
						});
					}
				}
			};
		});
	}

	onError(): Observable<SpeechNotification<never>> {
		return new Observable(observer => {
			this.recognition.onerror = (event) => {
				// tslint:disable-next-line:no-any
				const eventError: string = (event as any).error;
				console.log('error', eventError);
				let error: SpeechError;
				switch (eventError) {
					case 'no-speech':
						error = SpeechError.NoSpeech;
						break;
					case 'audio-capture':
						error = SpeechError.AudioCapture;
						break;
					case 'not-allowed':
						error = SpeechError.NotAllowed;
						break;
					default:
						error = SpeechError.Unknown;
						break;
				}

				this.ngZone.run(() => {
					observer.next({
						error
					});
				});
			};
		});
	}

	stop(): void {
		this.recognition.stop();
	}
}
