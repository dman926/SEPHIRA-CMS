import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';
import { CookieService } from 'ngx-cookie';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user';

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

	settingsForm: FormGroup;
	settingsSaved: boolean;

	private subs: Subscription[];

	constructor(private auth: AuthService, private router: Router, private cookie: CookieService) {
		this.qrVal = null;

		this.twoFForm = new FormGroup({
			otp: new FormControl('', [Validators.required])
		});
		this.otpSuccess = false;
		this.otpSuccessText = '';

		this.settingsForm = new FormGroup({
			enableTF: new FormControl(false)
		});
		this.settingsSaved = false;

		this.subs = [];
	}

	ngOnInit(): void {
		this.subs.push(this.auth.user$.subscribe(user => {
			if (user) {
				this.settingsForm.patchValue({
					enableTF: user.twoFactorEnabled ? true : false
				});	
			}
		}));
		this.auth.getOtpQr().toPromise().then(res => this.qrVal = res);
	}

	saveSettings(): void {
		if (this.settingsForm.valid) {
			const user: User = {
				twoFactorEnabled: this.settingsForm.get('enableTF')!.value
			}
			this.auth.updateUser(user).toPromise().then(res => {
				this.auth.getUser().toPromise().then(user => {
					this.auth.setUser(user);
					this.settingsSaved = true;
					setTimeout(() => this.settingsSaved = false, 3000);
				});
			});
		}
	}

	deleteUser(): void {
		this.auth.deleteUser().toPromise().then(res => {
			localStorage.clear();
			this.cookie.removeAll();
			this.auth.setUser(null);
			this.router.navigate(['/']);
		});
	}

	verifyOtp(): void {
		const otp = this.twoFForm.get('otp')?.value;
		if (this.twoFForm.valid && otp) {
			this.auth.CheckOtp(otp).toPromise().then(res => {
				this.otpSuccessText = 'Pass';
				this.otpSuccess = true;
				setTimeout(() => {
					this.otpSuccess = false;
				}, 3000);
			}).catch(err => {
				this.otpSuccessText = 'Fail';
				this.otpSuccess = true;
				setTimeout(() => {
					this.otpSuccess = false;
				}, 3000);
			});
		}
	}

}
