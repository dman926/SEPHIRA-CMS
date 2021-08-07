import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { AdminService } from '../../admin.service';

interface PageEvent {
	length: number;
	pageIndex: number;
	pageSize: number;
	previousPageIndex?: number;
}

@Component({
	selector: 'app-users',
	templateUrl: './users.component.html',
	styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

	loaded: boolean;
	users: User[];

	userPageEvent: PageEvent;
	userCount: number;

	constructor(private admin: AdminService) {
		this.loaded = false;
		this.users = [];
		this.userPageEvent = {
			length: 0,
			pageIndex: 0,
			pageSize: 10,
			previousPageIndex: 0
		};
		this.userCount = 0;
	}

	ngOnInit(): void {
		this.admin.getUserCount().toPromise().then(count => {
			this.userCount = count;
		});
		this.fetchUsers();
	}

	get shownUsers(): User[] {
		const index = this.userPageEvent.pageIndex;
		const size = this.userPageEvent.pageSize;
		return this.users.slice(index * size, index * size + size);
	}

	fetchUsers(event?: PageEvent): void {
		if (event) {
			this.userPageEvent = event;
			if (event.pageIndex * event.pageSize < this.users.length) {
				return;
			}
		}
		this.loaded = false;
		this.admin.getAllUsers(this.userPageEvent.pageIndex, this.userPageEvent.pageSize).toPromise().then(users => {
			this.users = this.users.concat(users);
			this.loaded = true;
		}).catch(err => this.loaded = true);
	}

}
