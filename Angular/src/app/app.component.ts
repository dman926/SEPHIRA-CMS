import { Component } from '@angular/core';
import { AuthService } from './features/auth/services/auth/auth.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent {
	title = 'SEPHIRA';

	// Load necessary services here that might not be loaded otherwise
	constructor(private auth: AuthService) { }

}
