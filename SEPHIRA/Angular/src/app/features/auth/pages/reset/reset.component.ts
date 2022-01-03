import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SephiraErrorStateMatcher } from 'src/app/core/classes/Error State Matcher/sephira-error-state-matcher';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
	selector: 'sephira-reset',
	templateUrl: './reset.component.html',
	styleUrls: ['./reset.component.scss'],
})
export class ResetComponent implements OnInit, OnDestroy {

	resetForm: FormGroup;
	isVisible: boolean;
	errorMatcher: SephiraErrorStateMatcher;
	token: string | undefined;
	resetting: boolean;
	
	private paramSub: Subscription | undefined;

	constructor(
		private auth: AuthService,
		private platform: PlatformService,
		private route: ActivatedRoute,
		private router: Router,
		private snackbar: MatSnackBar
	) {
		this.resetForm = new FormGroup({
			password: new FormControl('', [Validators.required])
		});
		this.isVisible = false;
		this.errorMatcher = new SephiraErrorStateMatcher();
		this.resetting = false;
	}

	ngOnInit(): void {
		if (this.platform.isBrowser) {
			this.paramSub = this.route.queryParams.subscribe(params => {
				this.token = params['t'];
			});
		}
	}

	ngOnDestroy(): void {
		this.paramSub?.unsubscribe();
	}

	resetPassword(): void {
		if (this.resetForm.valid && this.token) {
			this.resetting = true;
			this.auth.resetPassword(this.passwordControl.value, this.token).subscribe({
				next: res => {
					this.snackbar.open('Password Reset', 'Close', { duration: 2500 });
					if (typeof res === 'string') {
						this.router.navigate(['/login']);
					} else {
						this.auth.setTokens(res.access_token, res.refresh_token);
						this.auth.getUser().subscribe(user => {
							this.auth.setUser(user);
							this.router.navigate(['/']);
						});
					}
				},
				error: err => {
					this.resetting = false;
				}
			});
		}
	}

	get passwordControl(): FormControl {
		return this.resetForm.get('password')! as FormControl;
	}

}
