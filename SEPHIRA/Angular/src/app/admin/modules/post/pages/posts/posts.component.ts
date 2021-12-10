import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from 'src/app/admin/servies/admin.service';
import { CoreService } from 'src/app/core/services/core/core.service';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { Post } from 'src/app/models/posts/post';

@Component({
	selector: 'app-posts',
	templateUrl: './posts.component.html',
	styleUrls: ['./posts.component.scss'],
})
export class PostsComponent implements OnInit {

	posts: Post[];
	loaded: boolean;
	postPageEvent: PageEvent;
	postType: string | undefined;

	newPostGroup: FormGroup;
	creating: boolean;

	readonly displayedColumns = ['title', 'slug', 'author', 'modified', 'edit'];

	constructor(private admin: AdminService, private core: CoreService, private platform: PlatformService, private state: TransferState, private route: ActivatedRoute) {
		this.posts = [];
		this.loaded = false;
		this.postPageEvent = {
			pageIndex: 0,
			pageSize: 10,
			length: 0
		};
		this.newPostGroup = new FormGroup({
			title: new FormControl('', [Validators.required]),
			slug: new FormControl('', [Validators.required, Validators.pattern(this.core.slugRegex)])
		});
		this.creating = false;
	}

	ngOnInit(): void {
		this.route.parent!.params.subscribe(params => {
			this.postType = params['postType'];
			const postKey = makeStateKey<Post[]>('adminPosts');
			this.newPostGroup = new FormGroup({
				title: new FormControl('', [Validators.required]),
				slug: new FormControl('', [Validators.required, Validators.pattern(this.core.slugRegex)], [this.core.slugValidator(this.postType!)])
			});
			if (this.platform.isBrowser) {
				this.posts = this.state.get(postKey, []);
			}
			this.fetchPosts();
		});
	}

	newPost(): void {
		if (this.newPostGroup.valid) {
			const post: Post = {
				title: this.newPostGroup.get('title')!.value,
				slug: this.newPostGroup.get('slug')!.value
			}
			if (post.slug!.substring(0, 1) !== '/') {
				post.slug = '/' + post.slug;
			}
			this.creating = true;
			this.admin.submitPost(this.postType!, post).subscribe(post => {
				this.creating = false;
				this.posts.unshift(post);
			})
		}
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
		this.admin.getAllPosts(this.postType!, this.postPageEvent.pageIndex, this.postPageEvent.pageSize).subscribe({
			next: posts => {
				console.log(posts);
				this.postPageEvent.length = posts.count;
				this.posts = this.posts.concat(posts.posts);
				this.loaded = true;
			},
			error: err => {
				this.loaded = true;
			}
		});
	}

	get slug(): FormControl {
		return this.newPostGroup.get('slug')! as FormControl;
	}

}
