import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../../auth.service';

interface DialogData {
	email: string;
	password: string;
}

@Component({
	selector: 'app-otp-dialog',
	templateUrl: './otp-dialog.component.html',
	styleUrls: ['./otp-dialog.component.scss']
})
export class OtpDialogComponent {

	otpForm: FormGroup;

	constructor(private dialogRef: MatDialogRef<OtpDialogComponent>, @Inject(MAT_DIALOG_DATA) private data: DialogData, private auth: AuthService) {
		this.otpForm = new FormGroup({
			otp: new FormControl('', [Validators.required])
		});
	}

	submitOtp(): void {
		this.auth.login(this.data.email, this.data.password, this.otpForm.get('otp')!.value).toPromise().then(loginRes => {
			this.auth.setTokens(true, loginRes.accessToken, loginRes.refreshToken);
			this.auth.getUser().toPromise().then(user => {
				this.auth.setUser(user);
				this.dialogRef.close();
			});
		});
	}

}
