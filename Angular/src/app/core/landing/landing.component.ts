import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { merge, Observable, of, Subject, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SpeechError } from 'src/app/models/speech/speech-error';
import { SpeechEvent } from 'src/app/models/speech/speech-event';
import { SpeechNotification } from 'src/app/models/speech/speech-notification';
import { environment } from 'src/environments/environment';
import { SpeechRecognitionService } from '../services/speech-recognition.service';
import { SpeechSynthesisService } from '../services/speech-synthesis.service';
import { WebsocketService } from '../services/websocket.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, OnDestroy {

	contactForm = new FormGroup({
		email: new FormControl('', [Validators.required, Validators.email]),
		message: new FormControl('')
	});

	totalTranscript?: string;

	transcript$?: Observable<string>;
	listening$?: Observable<boolean>;
	errorMessage$?: Observable<string>;
	defaultError$ = new Subject<string | undefined>();

	private subs: Subscription[];

	constructor(private wsService: WebsocketService,
		private recaptcha: ReCaptchaV3Service,
		private http: HttpClient,
		private speechRecognitionService: SpeechRecognitionService,
		private speechSynthesisService: SpeechSynthesisService) {
		this.subs = [];
	}

	ngOnInit(): void {
		this.subs.push(this.wsService.listen('connection').subscribe(data => {
			console.log(data);
		}));

		const webSpeechReady = this.speechRecognitionService.initialize();
		if (webSpeechReady) {
			this.initRecognition();
		} else {
			this.errorMessage$ = of('Your Browser is not supported. Please try Google Chrome.');
		}
		const lorem = 'Dolorem iure officiis soluta est accusantium excepturi.';
		// Chrome requires you either trigger this with a user event or set the site audio to allow for running without a user interaction
		// this.speechSynthesisService.speak(lorem);
	}

	ngOnDestroy(): void {
		this.subs.forEach(sub => sub.unsubscribe());
	}

	submit(): void {
		console.log('fire');
		this.recaptcha.execute('importantAction').toPromise().then(token => {
			this.http.post(environment.apiServer + 'test', {token}).toPromise().then(res => {
				console.log(res);
			});
		});
	}

	start(): void {
		if (this.speechRecognitionService.isListening) {
			this.stop();
			return;
		}

		this.defaultError$.next(undefined);
		this.speechRecognitionService.start();
	}

	stop(): void {
		this.speechRecognitionService.stop();
	}

	private initRecognition(): void {
		this.transcript$ = this.speechRecognitionService.onResult().pipe(
			tap((notification) => {
				this.processNotification(notification);
			}),
			map((notification) => notification.content || '')
		);

		this.listening$ = merge(
			this.speechRecognitionService.onStart(),
			this.speechRecognitionService.onEnd()
		).pipe(map((notification) => notification.event === SpeechEvent.Start));

		this.errorMessage$ = merge(
			this.speechRecognitionService.onError(),
			this.defaultError$
		).pipe(
			map((data) => {
				if (data === undefined) {
					return '';
				}
				if (typeof data === 'string') {
					return data;
				}
				let message;
				switch (data.error) {
					case SpeechError.NotAllowed:
						message = `Your browser is not authorized to access your microphone.
				Verify that your browser has access to your microphone and try again.`;
						break;
					case SpeechError.NoSpeech:
						message = `No speech has been detected. Please try again.`;
						break;
					case SpeechError.AudioCapture:
						message = `Microphone is not available. Plese verify the connection of your microphone and try again.`;
						break;
					default:
						message = '';
						break;
				}
				return message;
			})
		);
	}

	private processNotification(notification: SpeechNotification<string>): void {
		if (notification.event === SpeechEvent.FinalContent) {
			const message = notification.content?.trim() || '';
			this.totalTranscript = this.totalTranscript
				? `${this.totalTranscript}\n${message}`
				: notification.content;
		}
	}

}
