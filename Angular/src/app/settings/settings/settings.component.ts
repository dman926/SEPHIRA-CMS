import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
	selector: 'app-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

	qrElementType = NgxQrcodeElementTypes.URL;
	qrErrorCorrectionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;
	qrVal: string | null;

	twoFForm: FormGroup;
	otpSuccess: boolean;
	otpSuccessText: string;

	constructor(private auth: AuthService, private router: Router) {
		this.qrVal = null;

		this.twoFForm = new FormGroup({
			otp: new FormControl('', [Validators.required])
		});
		this.otpSuccess = false;
		this.otpSuccessText = '';
	}

	ngOnInit(): void {
		this.auth.getOtpQr().toPromise().then(res => this.qrVal = res);
	}

	deleteUser(): void {
		this.auth.deleteUser().toPromise().then(res => {
			localStorage.clear();
			this.auth.setUser(null);
			this.router.navigate(['/']);
		});
	}

	verifyOtp(): void {
		const otp = this.twoFForm.get('otp')?.value;
		if (this.twoFForm.valid && otp) {
			this.auth.CheckOtp(otp).toPromise().then(res => {
				this.otpSuccessText = 'Pass'
				this.otpSuccess = true;
				setTimeout(() => {
					this.otpSuccess = false
				}, 3000);
			}).catch(err => {
				this.otpSuccessText = 'Fail';
				this.otpSuccess = true;
				setTimeout(() => {
					this.otpSuccess = false
				}, 3000);
			})
		}
	}

}
