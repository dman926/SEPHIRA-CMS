import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
	selector: 'app-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

	constructor(private auth: AuthService, private router: Router) { }

	ngOnInit(): void {
	}

	deleteUser(): void {
		this.auth.deleteUser().toPromise().then(res => {
			localStorage.clear();
			this.auth.setUser(null);
			this.router.navigate(['/']);
		});
	}

}
