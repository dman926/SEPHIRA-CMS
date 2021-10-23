import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroupDirective } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { PageEvent } from '@angular/material/paginator';
import { Post } from 'src/app/models/post';
import { AdminService } from '../../admin.service';

@Component({
	selector: 'app-post-select',
	templateUrl: './post-select.component.html',
	styleUrls: ['./post-select.component.scss']
})
export class PostSelectComponent implements OnInit {

	@Input() type: string | undefined;
	@Input() formArrayName: string | undefined
	@Input() allowMultiple: boolean;

	formArray: FormArray | undefined;

	posts: Post[];
	postPageEvent: PageEvent;
	loaded: boolean;

	constructor(private admin: AdminService, private rootFormGroup: FormGroupDirective) {
		this.allowMultiple = false;
		this.posts = [];
		this.postPageEvent = {
			pageIndex: 0,
			pageSize: 10,
			length: 0
		};
		this.loaded = false;
	}

	ngOnInit(): void {
		if (this.formArrayName) {
			this.formArray = this.rootFormGroup.control.get(this.formArrayName) as FormArray;
			if (this.type) {
				this.fetchPosts();
			} else {
				throw new Error('`type` is a required input');
			}
		} else {
			throw new Error('`formArrayName` is a required input');
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
		this.admin.getAllPosts(this.type!, this.postPageEvent.pageIndex, this.postPageEvent.pageSize).toPromise().then(posts => {
			this.postPageEvent.length = posts.count;
			this.posts = this.posts.concat(posts.posts);
			this.loaded = true;
		}).catch(err => this.loaded = true);
	}

	postSelectedChange(event: MatCheckboxChange, id: string): void {
		if (this.allowMultiple) {
			let foundIndex = -1
			for (let i = 0; i < this.formArray!.length; i++) {
				if (this.formArray!.at(i).value === id) {
					foundIndex = i;
					break;
				}
			}
			if (foundIndex >= 0) {
				this.formArray!.removeAt(foundIndex);
			} else {
				this.formArray!.push(new FormControl(id));
			}
		} else {
			if (this.formArray!.length > 0) {
				this.formArray!.at(0).setValue(id);
			} else {
				this.formArray!.push(new FormControl(id));
			}
		}
	}

	isSelected(id: string): boolean {
		for (let i = 0; i < this.formArray!.length; i++) {
			if (this.formArray!.at(i).value === id) {
				return true;
			}
		}
		return false;
	}

}
