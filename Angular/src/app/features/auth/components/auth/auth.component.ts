import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { AuthService } from '../../services/auth/auth.service';
import { OtpDialogComponent } from '../otp-dialog/otp-dialog.component';

@Component({
	selector: 'app-auth',
	templateUrl: './auth.component.html',
	styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit {

	@Input() hideLogin: boolean;
	@Input() hideRegister: boolean;

	loginForm: FormGroup;

	isVisible: boolean;
	loggingIn: boolean;

	private returnUrl: string;

	constructor(
		private auth: AuthService,
		private dialog: MatDialog,
		private platform: PlatformService,
		private route: ActivatedRoute,
		private router: Router) {
		this.hideLogin = false;
		this.hideRegister = false;

		this.loginForm = new FormGroup({
			email: new FormControl('', [Validators.required, Validators.email]),
			password: new FormControl('', [Validators.required])
		});
		this.isVisible = false;
		this.loggingIn = false;
		this.returnUrl = '';
	}

	ngOnInit(): void {
		if (this.platform.isBrowser) {
			this.route.queryParams.subscribe(params => {
				this.returnUrl = params['return'];
			});	
		}
	}

	login(): void {
		if (this.loginForm.valid) {
			this.loggingIn = true;
			const email = this.loginForm.get('email')!.value;
			const password = this.loginForm.get('password')!.value;
			this.auth.login(email, password).subscribe({
				next: loginRes => {
					this.auth.setTokens(loginRes.accessToken, loginRes.refreshToken);
					this.auth.getUser().subscribe(user => {
						this.auth.setUser(user);
						this.router.navigateByUrl(this.returnUrl);
					});
				},
				error: err => {
					if (err.status === 401 && err.error.detail === 'Missing otp') {
						const diag = this.dialog.open(OtpDialogComponent, {
							width: '250px',
							data: { email, password }
						});
						diag.afterClosed().subscribe(() => {
							this.loggingIn = false;
						})
					} else {
						this.loggingIn = false;
					}
				}
			});
		}
	}

	register(): void {
		if (this.loginForm.valid) {
			this.loggingIn = true;
			const email = this.loginForm.get('email')!.value;
			const password = this.loginForm.get('password')!.value;
			this.auth.signup(email, password).subscribe({
				next: signupRes => {
					this.auth.login(email, password).subscribe({
						next: loginRes => {
							this.auth.setTokens(loginRes.accessToken, loginRes.refreshToken);
							this.auth.getUser().subscribe(user => {
								this.auth.setUser(user);
								this.router.navigateByUrl(this.returnUrl);
							});
						},
						error: err => {
							this.loggingIn = false;
						}
					});
				},
				error: err => {
					if (err.status === 400 && err.error.detail === 'User with details already exists') {
						console.error(err);
					}
					this.loggingIn = false;
				}
			});
		}
	}

}
