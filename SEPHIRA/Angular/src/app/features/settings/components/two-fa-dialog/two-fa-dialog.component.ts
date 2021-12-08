import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/features/auth/services/auth/auth.service';

@Component({
	selector: 'app-two-fa-dialog',
	templateUrl: './two-fa-dialog.component.html',
	styleUrls: ['./two-fa-dialog.component.scss'],
})
export class TwoFaDialogComponent implements OnInit {

	otpCheckFormGroup: FormGroup;
	otpQrVal: string;

	constructor(
		private dialogRef: MatDialogRef<TwoFaDialogComponent>,
		private auth: AuthService
	) {
		this.otpCheckFormGroup = new FormGroup({
			otpCode: new FormControl('', [Validators.required])
		});
		this.otpQrVal = '';
	}

	ngOnInit(): void {
		this.auth.getOtpUri().subscribe(val => this.otpQrVal = val);
	}

	checkOtpCode(): void {
		if (this.otpCheckFormGroup.valid) {
			this.auth.checkOtp(this.otpCodeFormControl.value).subscribe({
				next: res => {
					this.dialogRef.close(true);
				},
				error: err => {
					// TODO: display that it failed
					console.error(err);
				}
			});
		}
	}

	close(): void {
		this.dialogRef.close(false);
	}

	get otpCodeFormControl(): FormControl {
		return this.otpCheckFormGroup.get('otpCode')! as FormControl;
	}

}
