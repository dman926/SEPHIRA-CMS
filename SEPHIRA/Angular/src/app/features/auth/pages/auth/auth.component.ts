import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SephiraErrorStateMatcher } from 'src/app/core/classes/Error State Matcher/sephira-error-state-matcher';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { AuthService } from '../../services/auth/auth.service';
import { OtpDialogComponent } from '../../components/otp-dialog/otp-dialog.component';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
	selector: 'sephira-auth',
	templateUrl: './auth.component.html',
	styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit, OnDestroy {

	@Input() hideLogin: boolean;
	@Input() hideRegister: boolean;

	loginForm: FormGroup;

	isVisible: boolean;
	loggingIn: boolean;
	signupPrompt: string;
	signupOK: boolean;
	resettingPassword: boolean;
	sendingVerification: boolean;
	verificationSent: boolean;

	errorMatcher: SephiraErrorStateMatcher;

	private returnUrl: string;
	private querySub: Subscription | undefined;

	constructor(
		private auth: AuthService,
		private dialog: MatDialog,
		private platform: PlatformService,
		public theme: ThemeService,
		private route: ActivatedRoute,
		private router: Router,
		private snackbar: MatSnackBar) {
		this.hideLogin = false;
		this.hideRegister = false;

		this.loginForm = new FormGroup({
			email: new FormControl('', [Validators.required, Validators.email]),
			password: new FormControl('', [Validators.required])
		});
		this.isVisible = false;
		this.loggingIn = false;
		this.signupPrompt = '';
		this.signupOK = false;
		this.resettingPassword = false;
		this.sendingVerification = false;
		this.verificationSent = false;
		this.errorMatcher = new SephiraErrorStateMatcher();
		this.returnUrl = '';
	}

	ngOnInit(): void {
		if (this.platform.isBrowser) {
			this.querySub = this.route.queryParams.subscribe(params => {
				this.returnUrl = params['return'];
				const token = params['t'];
				if (token) {
					this.auth.verify(token).subscribe(res => {
						const queryParams = {...params};
						queryParams['t'] = null;
						console.log(queryParams);
						this.router.navigate([], { queryParams, replaceUrl: true, queryParamsHandling: 'merge' });
					});
				}
			});
		}
	}

	ngOnDestroy(): void {
		this.querySub?.unsubscribe();
	}

	login(): void {
		if (this.loginForm.valid) {
			this.loggingIn = true;
			const email = this.emailFormControl.value;
			const password = this.passwordFormControl.value;
			this.auth.login(email, password).subscribe({
				next: loginRes => {
					this.auth.setTokens(loginRes.access_token, loginRes.refresh_token);
					this.auth.getUser().subscribe(user => {
						this.auth.setUser(user);
						this.showSnackBar();
						this.router.navigateByUrl(this.returnUrl);
					});
				},
				error: err => {
					if (err.status === 401) {
						if (err.error.detail === 'Missing otp') {
							const diag = this.dialog.open(OtpDialogComponent, {
								width: '250px',
								panelClass: this.theme.theme === 'light' ? '' : 'sephira-dark',
								data: { email, password, returnUrl: this.returnUrl }
							});
							diag.afterClosed().subscribe(val => {
								if (val) {
									this.showSnackBar();
								}
								this.loggingIn = false;
							})
						} else if (err.error.detail === 'Not verified') {
							this.signupPrompt = 'Your email is not verified.';
							this.signupOK = true;
						}
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
			const email = this.emailFormControl.value;
			const password = this.passwordFormControl.value;
			this.auth.signup(email, password).subscribe({
				next: signupRes => {
					this.signupPrompt = 'You\'ve signed up.';
					this.signupOK = true;
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

	resetPassword(): void {
		if (this.emailFormControl.valid) {
			this.resettingPassword = true;
			this.auth.forgotPassword(this.emailFormControl.value).subscribe({
				next: res => {
					this.snackbar.open('Sent. Check Your Email', 'Close', { duration: 2500 })
					setTimeout(() => {
						this.resettingPassword = false;
					}, 2500);
				},
				error: err => {
					this.resettingPassword = false;
				}
			})
		}
	}

	resendVerification(): void {
		this.sendingVerification = true;
		this.auth.resendVerify(this.emailFormControl.value).subscribe(res => {
			this.verificationSent = true;
			setTimeout(() => {
				this.sendingVerification = false;
				this.verificationSent = false;
			}, 5000);
		});
	}

	private showSnackBar(): void {
		this.snackbar.open('Logged In', 'Close', { duration: 2500 });
	}

	get emailFormControl(): FormControl {
		return this.loginForm.get('email')! as FormControl;
	}

	get passwordFormControl(): FormControl {
		return this.loginForm.get('password')! as FormControl;
	}

}
