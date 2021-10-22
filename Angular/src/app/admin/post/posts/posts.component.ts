import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { PlatformService } from 'src/app/core/services/platform.service';
import { Post } from 'src/app/models/post';
import { AdminService } from '../../admin.service';

@Component({
	selector: 'app-posts',
	templateUrl: './posts.component.html',
	styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit, OnDestroy {

	posts: Post[];
	loaded: boolean;
	postPageEvent: PageEvent;
	postType: string | undefined;

	private parentParamsSub: Subscription | undefined;

	constructor(private route: ActivatedRoute, private platform: PlatformService, private admin: AdminService) {
		this.posts = [];
		this.loaded = false;
		this.postPageEvent = {
			pageIndex: 0,
			pageSize: 10,
			length: 0
		}
	}

	ngOnInit(): void {
		if (this.platform.isBrowser()) {
			this.parentParamsSub = this.route.parent!.params.subscribe(params => {
				this.postType = params.postType;
				this.fetchPosts();				
			});
		}
	}

	ngOnDestroy(): void {
		this.parentParamsSub?.unsubscribe();
	}

	get shownPosts(): Post[] {
		const index = this.postPageEvent.pageIndex;
		const size = this.postPageEvent.pageSize;
		return this.posts.slice(index * size, index * size + size);
	}

	fetchPosts(event?: PageEvent): void {
		if (event) {
			this.postPageEvent = event;
			if (event.pageIndex * event.pageSize < this.posts.length) {
				return;
			}
		}
		this.loaded = false;
		this.admin.getAllPosts(this.postType!, this.postPageEvent.pageIndex, this.postPageEvent.pageSize).toPromise().then(posts => {
			this.postPageEvent.length = posts.count;
			this.posts = this.posts.concat(posts.posts);
			this.loaded = true;
		}).catch(err => this.loaded = true);
	}

}
