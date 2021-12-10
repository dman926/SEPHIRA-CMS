import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SephiraErrorStateMatcher } from 'src/app/core/classes/Error State Matcher/sephira-error-state-matcher';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { AuthService } from '../../services/auth/auth.service';
import { OtpDialogComponent } from '../../components/otp-dialog/otp-dialog.component';

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

	errorMatcher: SephiraErrorStateMatcher;

	private returnUrl: string;

	constructor(
		private auth: AuthService,
		private dialog: MatDialog,
		private platform: PlatformService,
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
		this.errorMatcher = new SephiraErrorStateMatcher();
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
			const email = this.emailFormControl.value;
			const password = this.passwordFormControl.value;
			this.auth.login(email, password).subscribe({
				next: loginRes => {
					this.auth.setTokens(loginRes.token, loginRes.refreshToken);
					this.auth.getUser().subscribe(user => {
						this.auth.setUser(user);
						this.showSnackBar();
						this.router.navigateByUrl(this.returnUrl);
					});
				},
				error: err => {
					if (err.status === 401 && err.error.detail === 'Missing otp') {
						const diag = this.dialog.open(OtpDialogComponent, {
							width: '250px',
							data: { email, password, returnUrl: this.returnUrl }
						});
						diag.afterClosed().subscribe(val => {
							if (val) {
								this.showSnackBar();
							}
							this.loggingIn = false;
						})
					} else {
						this.loggingIn = false;
					}
					console.error(err);
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
					this.auth.login(email, password).subscribe({
						next: loginRes => {
							this.auth.setTokens(loginRes.token, loginRes.refreshToken);
							this.auth.getUser().subscribe(user => {
								this.auth.setUser(user);
								this.showSnackBar();
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
