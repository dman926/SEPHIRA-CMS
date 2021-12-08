import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/features/auth/services/auth/auth.service';
import { User } from 'src/app/models/user';

@Component({
	selector: 'app-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {

	user: User | null;
	settingsFormGroup: FormGroup;
	otpQrVal: string;

	private formSetPass: boolean;

	constructor(private auth: AuthService) {
		this.user = null;
		this.settingsFormGroup = new FormGroup({
			firstName: new FormControl('', [Validators.required]),
			lastName: new FormControl('', [Validators.required]),
			enableTF: new FormControl(false)
		});
		this.otpQrVal = '';
		this.formSetPass = false;
	}

	ngOnInit(): void {
		this.auth.user$.subscribe(user => {
			this.user = user;
			console.log(user);
			if (!this.formSetPass && user) { // Only checking for user here to simplify TS typehandling
				// Only set the form controls once to avoid overwriting while the user is editing
				this.formSetPass = true;
				this.settingsFormGroup.patchValue({
					firstName: user.firstName,
					lastName: user.lastName,
					enableTF: user.twoFactorEnabled ? true : false
				});
				this.auth.getOtpUri().subscribe(val => {
					this.otpQrVal = val
					console.log(val);
				});
			}
		});
	}

}
