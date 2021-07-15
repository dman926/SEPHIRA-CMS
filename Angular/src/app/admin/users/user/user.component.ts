import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/user';
import { AdminService } from '../../admin.service';

@Component({
	selector: 'app-user',
	templateUrl: './user.component.html',
	styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, OnDestroy {

	user: User | undefined;

	private subs: Subscription[];

	constructor(private admin: AdminService, private route: ActivatedRoute) {
		this.subs = [];
	}

	ngOnInit(): void {
		this.subs.push(this.route.paramMap.subscribe(params => {
			const id = params.get('id');
			if (id) {
				this.admin.getUser(id).toPromise().then(user => {
					this.user = user;
				});
			}
		}));
	}

	ngOnDestroy(): void {
		this.subs.forEach(sub => sub.unsubscribe());
	}

}
