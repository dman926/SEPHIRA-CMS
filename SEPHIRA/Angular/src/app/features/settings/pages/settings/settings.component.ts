import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { AuthService } from 'src/app/features/auth/services/auth/auth.service';
import { User } from 'src/app/models/user';
import { TwoFaDialogComponent } from '../../components/two-fa-dialog/two-fa-dialog.component';

@Component({
	selector: 'app-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {

	user: User | null;
	settingsFormGroup: FormGroup;

	saving: boolean;

	private formSetPass: boolean;

	constructor(
		private auth: AuthService,
		private platform: PlatformService,
		private dialog: MatDialog
	) {
		this.user = null;
		this.settingsFormGroup = new FormGroup({
			firstName: new FormControl('', [Validators.required]),
			lastName: new FormControl('', [Validators.required]),
			enableTF: new FormControl(false)
		});
		this.saving = false;
		this.formSetPass = false;
	}

	ngOnInit(): void {
		if (this.platform.isBrowser) {
			this.auth.user$.subscribe(user => {
				this.user = user;
				if (!this.formSetPass && user) { // Only checking for user here to simplify TS typehandling
					// Only set the form controls once to avoid overwriting while the user is editing
					this.formSetPass = true;
					this.settingsFormGroup.patchValue({
						firstName: user.firstName,
						lastName: user.lastName,
						enableTF: user.twoFactorEnabled ? true : false
					});
				}
			});
		}
	}

	saveSettings(): void {
		if (this.settingsFormGroup.valid && this.user) {
			this.saving = true;
			const newUser: User = {
				firstName: this.firstNameFormControl.value,
				lastName: this.lastNameFormControl.value,
				twoFactorEnabled: this.enableTFFormControl.value
			};
			// Open two factor confirmation only if it's being enabled and previously was disabled
			if (newUser.twoFactorEnabled && !this.user.twoFactorEnabled) {
				this.dialog.open(TwoFaDialogComponent, {
					width: '250px'
				}).afterClosed().subscribe(res => {
					if (res) {
						this.updateUser(newUser);
					}
				})
			} else {
				this.updateUser(newUser);
			}
		}
	}

	get firstNameFormControl(): FormControl {
		return this.settingsFormGroup.get('firstName')! as FormControl;
	}

	get lastNameFormControl(): FormControl {
		return this.settingsFormGroup.get('lastName')! as FormControl;
	}

	get enableTFFormControl(): FormControl {
		return this.settingsFormGroup.get('enableTF')! as FormControl;
	}

	private updateUser(user: User) {
		this.auth.updateUser(user).subscribe({
			next: res => {
				// TODO: display to user that save was successful
				this.saving = false;
				this.user!.firstName = user.firstName,
				this.user!.lastName = user.lastName
				this.user!.twoFactorEnabled = user.twoFactorEnabled;
			},
			error: err => {
				this.saving = false;
			}
		});
	}

}
