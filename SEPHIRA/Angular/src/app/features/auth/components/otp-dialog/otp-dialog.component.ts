import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SephiraErrorStateMatcher } from 'src/app/core/classes/Error State Matcher/sephira-error-state-matcher';
import { AuthService } from '../../services/auth/auth.service';

interface DialogData {
	email: string;
	password: string;
	returnUrl: string;
}

@Component({
	selector: 'app-otp-dialog',
	templateUrl: './otp-dialog.component.html',
	styleUrls: ['./otp-dialog.component.scss'],
})
export class OtpDialogComponent {

	otpForm: FormGroup
	loggingIn: boolean;

	errorMatcher: SephiraErrorStateMatcher;

	constructor(public dialogRef: MatDialogRef<OtpDialogComponent>, @Inject(MAT_DIALOG_DATA) private data: DialogData, private auth: AuthService, private router: Router) {
		this.otpForm = new FormGroup({
			otp: new FormControl('', [Validators.required])
		});
		this.loggingIn = false;
		this.errorMatcher = new SephiraErrorStateMatcher();
	}

	submitOtp(): void {
		if (this.otpForm.valid) {
			this.loggingIn = true;
			this.auth.login(this.data.email, this.data.password, this.otpFormControl.value).subscribe({
				next: loginRes => {
					this.auth.setTokens(loginRes.token, loginRes.refreshToken);
					this.auth.getUser().subscribe(user => {
						this.auth.setUser(user);
						this.dialogRef.close(true);
						this.router.navigateByUrl(this.data.returnUrl);
					});
				},
				error: err => {
					this.loggingIn = false;
				}
			});
		}
	}

	get otpFormControl(): FormControl {
		return this.otpForm.get('otp')! as FormControl;
	}

}
