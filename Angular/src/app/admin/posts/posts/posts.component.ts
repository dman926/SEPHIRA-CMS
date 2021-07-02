import { Component, OnInit } from '@angular/core';
import { Post } from 'src/app/models/post';
import { AdminService } from '../../admin.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { debounceTime, map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

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

	editorConfig: AngularEditorConfig = {
		editable: true,
		spellcheck: true,
		height: 'auto',
		minHeight: '0',
		maxHeight: 'auto',
		width: 'auto',
		minWidth: '0',
		translate: 'yes',
		enableToolbar: true,
		showToolbar: true,
		placeholder: 'Enter text here...',
		sanitize: false,
		toolbarPosition: 'top',
	};
	newPostGroup: FormGroup;

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
		this.newPostGroup = new FormGroup({
			title: new FormControl('', [Validators.required]),
			slug: new FormControl('', [Validators.required], [this.slugValidator()]),
			excerpt: new FormControl(''),
			htmlContent: new FormControl('')
		});
	}

	ngOnInit(): void {
		this.admin.getPostCount().toPromise().then(count => {
			this.postCount = count;
		});
		this.fetchPosts();
	}

	newPost(): void {
		if (this.newPostGroup.valid) {
			const post: Post = {
				title: this.newPostGroup.get('title')!.value,
				slug: this.newPostGroup.get('slug')!.value,
				excerpt: this.newPostGroup.get('excerpt')!.value,
				content: this.newPostGroup.get('htmlContent')!.value
			}
			this.admin.submitPost(post).toPromise().then(post => {
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
		}
		this.loaded = false;
		this.admin.getAllPosts(this.postPageEvent.pageIndex, this.postPageEvent.pageSize).toPromise().then(posts => {
			this.posts = this.posts.concat(posts);
			this.loaded = true;
		}).catch(err => this.loaded = true);
	}

	get slug(): FormControl {
		return this.newPostGroup.get('slug')! as FormControl;
	}

	private slugValidator(): AsyncValidatorFn {
		return (control: AbstractControl): Observable<ValidationErrors | null> => {
			return this.admin.checkIfSlugTaken(control.value).pipe(
				debounceTime(500),
				take(1),
				map(res => !res ? { slugTaken: true } : null)
			);
		};
	}

}
