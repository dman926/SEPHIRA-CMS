import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../auth.service';
import { OtpDialogComponent } from './otp-dialog/otp-dialog.component';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent {

	loginForm: FormGroup;

	isVisible: boolean;
	loggingIn: boolean;

	constructor(private auth: AuthService, private dialog: MatDialog) {
		this.isVisible = false;
		this.loggingIn = false;
		this.loginForm = new FormGroup({
			email: new FormControl('', [Validators.required, Validators.email]),
			password: new FormControl('', [Validators.required])
		});
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
			}).catch(err => {
				console.log(err.error.message);
				if (err.error.message === 'Missing OTP Error') {
					const dialogRef = this.dialog.open(OtpDialogComponent, {
						width: '250px',
						data: {email, password}
					});
				} else {
					this.loggingIn = false
				}
			});
		}
	}

	register(): void {
		if (this.loginForm.valid) {
			this.loggingIn = true;
			const email = this.loginForm.get('email')?.value;
			const password = this.loginForm.get('password')?.value;
			this.auth.signup(email, password).toPromise().then(signupRes => {
				this.auth.login(email, password).toPromise().then(loginRes => {
					this.auth.setTokens(true, loginRes.accessToken, loginRes.refreshToken);
					this.auth.getUser().toPromise().then(user => {
						this.auth.setUser(user);
					}).catch(err => this.loggingIn = false);
				}).catch(err => this.loggingIn = false);	
			});
		}
	}

}
