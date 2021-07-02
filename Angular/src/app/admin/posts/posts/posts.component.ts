import { Component, OnInit } from '@angular/core';
import { Post } from 'src/app/models/post';
import { AdminService } from '../../admin.service';

interface PageEvent {
	length: number;
	pageIndex: number;
	pageSize: number;
	previousPageIndex?: number;
}

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {

	loaded: boolean;
	posts: Post[];

	postPageEvent: PageEvent;
	postCount: number;

	constructor(private admin: AdminService) {
		this.loaded = false;
		this.posts = [];
		this.postPageEvent = {
			length: 0,
			pageIndex: 0,
			pageSize: 10,
			previousPageIndex: 0
		};
		this.postCount = 0;
	}

	ngOnInit(): void {
		this.admin.getPostCount().toPromise().then(count => {
			this.postCount = count;
		});
		this.fetchPosts();
	}

	get shownPosts(): Post[] {
		const index = this.postPageEvent.pageIndex;
		const size = this.postPageEvent.pageSize;
		return this.posts.slice(index * size, index * size + size);
	}

	fetchPosts(event?: PageEvent): void {
		if (event) {
			this.postPageEvent = event;
		}
		this.loaded = false;
		this.admin.getAllPosts(this.postPageEvent.pageIndex, this.postPageEvent.pageSize).toPromise().then(posts => {
			this.posts = this.posts.concat(posts);
			console.log(posts);
			this.loaded = true;
		}).catch(err => this.loaded = true);
	}

}
