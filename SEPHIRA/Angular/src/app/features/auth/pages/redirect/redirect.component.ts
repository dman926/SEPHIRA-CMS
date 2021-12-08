import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlatformService } from 'src/app/core/services/platform/platform.service';

@Component({
	selector: 'app-redirect',
	templateUrl: './redirect.component.html',
	styleUrls: ['./redirect.component.scss'],
})
export class RedirectComponent implements OnInit {
	
	constructor(private route: ActivatedRoute, private router: Router, private platform: PlatformService) { }

	ngOnInit(): void {
		if (this.platform.isBrowser) {
			this.route.queryParams.subscribe(params => {
				this.router.navigateByUrl(params['return']);
			});	
		}
	}

}
