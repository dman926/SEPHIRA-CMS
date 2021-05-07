import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
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
	})

	private subs: Subscription[];

	constructor(private wsService: WebsocketService, private recaptcha: ReCaptchaV3Service, private http: HttpClient) {
		this.subs = [];
	}

	ngOnInit(): void {
		this.subs.push(this.wsService.listen('connection').subscribe(data => {
			console.log(data);
		}));
	}

	ngOnDestroy(): void {
		this.subs.forEach(sub => sub.unsubscribe());
	}

	submit(): void {
		console.log('fire')
		this.recaptcha.execute('importantAction').toPromise().then(token => {
			this.http.post(environment.apiServer + 'test', {token}).toPromise().then(res => {
				console.log(res);
			});
		});
	}

}
