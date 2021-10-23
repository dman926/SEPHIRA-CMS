import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { debounceTime, map, take } from 'rxjs/operators';
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

	newPostGroup: FormGroup;
	creating: boolean;

	readonly displayedColumns = ['title', 'slug', 'author', 'modified', 'edit'];

	private parentParamsSub: Subscription | undefined;

	constructor(private route: ActivatedRoute, private platform: PlatformService, private admin: AdminService) {
		this.posts = [];
		this.loaded = false;
		this.postPageEvent = {
			pageIndex: 0,
			pageSize: 10,
			length: 0
		};
		this.newPostGroup = new FormGroup({
			title: new FormControl('', [Validators.required]),
			slug: new FormControl('', [Validators.required, Validators.pattern('^([/]?)+([a-z0-9]?)+(?:-[a-z0-9]+)*$')], [this.slugValidator()])
		});
		this.creating = false;
	}

	ngOnInit(): void {
		if (this.platform.isBrowser()) {
			this.parentParamsSub = this.route.parent!.params.subscribe(params => {
				this.postType = params.postType;
				this.fetchPosts();
				this.newPostGroup.get('slug')!.valueChanges.subscribe(val => {
					console.log(this.newPostGroup.get('slug')!.errors);
				})
			});
		}
	}

	ngOnDestroy(): void {
		this.parentParamsSub?.unsubscribe();
	}

	newPost(): void {
		if (this.newPostGroup.valid) {
			const post: Post = {
				title: this.newPostGroup.get('title')!.value,
				slug: this.newPostGroup.get('slug')!.value
			}
			if (post.slug!.substr(0, 1) !== '/') {
				post.slug = '/' + post.slug;
			}
			this.creating = true;
			this.admin.submitPost(this.postType!, post).toPromise().then(post => {
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
		this.admin.getAllPosts(this.postType!, this.postPageEvent.pageIndex, this.postPageEvent.pageSize).toPromise().then(posts => {
			this.postPageEvent.length = posts.count;
			this.posts = this.posts.concat(posts.posts);
			this.loaded = true;
		}).catch(err => this.loaded = true);
	}

	get slug(): FormControl {
		return this.newPostGroup.get('slug')! as FormControl;
	}

	private slugValidator(): AsyncValidatorFn {
		return (control: AbstractControl): Observable<ValidationErrors | null> => {
			if (control.hasError('pattern')) {
				return of(null);
			} else {
				return this.admin.checkPostSlugTaken(this.postType!, control.value).pipe(
					debounceTime(500),
					take(1),
					map(res => !res ? { slugTaken: true } : null)
				);	
			}
		};
	}

}
