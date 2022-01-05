import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PlatformService } from 'src/app/core/services/platform/platform.service';

@Component({
	selector: 'sephira-redirect',
	templateUrl: './redirect.component.html',
	styleUrls: ['./redirect.component.scss'],
})
export class RedirectComponent implements OnInit, OnDestroy {
	
	private querySub: Subscription | undefined;

	constructor(private route: ActivatedRoute, private router: Router, private platform: PlatformService) { }

	ngOnInit(): void {
		// TODO: try out removing 19 and 23 and see if SSR works on it
		if (this.platform.isBrowser) {
			this.querySub = this.route.queryParams.subscribe(params => {
				this.router.navigateByUrl(params['return']);
			});	
		}
	}

	ngOnDestroy(): void {
		this.querySub?.unsubscribe();
	}

}
