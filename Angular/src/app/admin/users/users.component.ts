import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { AdminService } from '../admin.service';

@Component({
	selector: 'app-users',
	templateUrl: './users.component.html',
	styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

	gettingUsers: boolean;
	users: User[];

	constructor(private admin: AdminService) {
		this.gettingUsers = true;
		this.users = [];
	}

	ngOnInit(): void {
		this.admin.getAllUsers().toPromise().then(res => {
			this.users = res;
			this.gettingUsers = false;
		});
	}

}
