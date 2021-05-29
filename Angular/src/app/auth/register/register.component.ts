import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

	registerForm: FormGroup;

	isVisible: boolean;
	registering: boolean;

	constructor(private auth: AuthService) {
		this.isVisible = false;
		this.registering = false;
		this.registerForm = new FormGroup({
			email: new FormControl('', [Validators.required, Validators.email]),
			password: new FormControl('', [Validators.required])
		});
	}

	ngOnInit(): void {
	}

	register(): void {
		if (this.registerForm.valid) {
			this.registering = true;
			const email = this.registerForm.get('email')?.value;
			const password = this.registerForm.get('password')?.value;
			this.auth.signup(email, password).toPromise().then(registerRes => {
				this.auth.login(email, password).toPromise().then(loginRes => {
					this.auth.setTokens(true, loginRes.accessToken, loginRes.refreshToken);
					this.auth.getUser().toPromise().then(user => {
						this.auth.setUser(user);
					}).catch(err => this.registering = false);
				}).catch(err => this.registering = false);
			}).catch(err => this.registering = false);
		}
	}

}
