import { Component, OnInit } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { AdminService } from '../../../../services/admin.service';

@Component({
	selector: 'sephira-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

	types: string[];

	constructor(private admin: AdminService, private platform: PlatformService, private state: TransferState) {
		this.types = [];
	}

	ngOnInit(): void {
		const stateKey = makeStateKey<string[]>('types');
		if (this.platform.isServer) {
			this.admin.getPostTypes().subscribe(types => {
				this.types = types;
				this.state.set(stateKey, types);
			});	
		} else {
			const types = this.state.get(stateKey, null);
			if (types) {
				this.types = types;
			} else {
				this.admin.getPostTypes().subscribe(types => {
					this.types = types;
				});
			}
		}
	}

}
