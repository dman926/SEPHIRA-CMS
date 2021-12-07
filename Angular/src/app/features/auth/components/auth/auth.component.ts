import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
	selector: 'app-auth',
	templateUrl: './auth.component.html',
	styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {

	@Input() hideLogin: boolean;
	@Input() hideRegister: boolean;

	loginForm: FormGroup;

	isVisible: boolean;
	loggingIn: boolean;

	constructor() {
		this.hideLogin = false;
		this.hideRegister = false;

		this.loginForm = new FormGroup({
			email: new FormControl('', [Validators.required, Validators.email]),
			password: new FormControl('', [Validators.required])
		});
		this.isVisible = false;
		this.loggingIn = false;
	}

	login(): void {

	}

	register(): void {
		
	}

}
