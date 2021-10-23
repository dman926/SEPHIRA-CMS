import { Component, OnInit } from '@angular/core';
import { PlatformService } from 'src/app/core/services/platform.service';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

	types: string[];

	constructor(private admin: AdminService, private platform: PlatformService) {
		this.types = [];
	}

	ngOnInit(): void {
	  if (this.platform.isBrowser()) {
		this.admin.getPostTypes().toPromise().then(types => {
			this.types = types;
		});
	  }
  }

}
