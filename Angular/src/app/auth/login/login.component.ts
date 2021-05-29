import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

	loginForm: FormGroup;

	isVisible: boolean;
	loggingIn: boolean;

	constructor(private auth: AuthService) {
		this.isVisible = false;
		this.loggingIn = false;
		this.loginForm = new FormGroup({
			email: new FormControl('', [Validators.required, Validators.email]),
			password: new FormControl('', [Validators.required])
		});
	}

	ngOnInit(): void {
	}

	login(): void {
		if (this.loginForm.valid) {
			this.loggingIn = true;
			const email = this.loginForm.get('email')?.value;
			const password = this.loginForm.get('password')?.value;
			this.auth.login(email, password).toPromise().then(loginRes => {
				this.auth.setTokens(true, loginRes.accessToken, loginRes.refreshToken);
				this.auth.getUser().toPromise().then(user => {
					this.auth.setUser(user);
				}).catch(err => this.loggingIn = false);
			}).catch(err => this.loggingIn = false);
		}
	}

}
