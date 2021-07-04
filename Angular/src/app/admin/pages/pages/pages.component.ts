import { Component, OnInit } from '@angular/core';
import { Page } from 'src/app/models/page';
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
	selector: 'app-pages',
	templateUrl: './pages.component.html',
	styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit {

	loaded: boolean;
	pages: Page[];

	pagePageEvent: PageEvent;
	pageCount: number;

	readonly editorConfig: AngularEditorConfig = {
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
	newPageGroup: FormGroup;

	constructor(private admin: AdminService) {
		this.loaded = false;
		this.pages = [];
		this.pagePageEvent = {
			length: 0,
			pageIndex: 0,
			pageSize: 10,
			previousPageIndex: 0
		};
		this.pageCount = 0;
		this.newPageGroup = new FormGroup({
			title: new FormControl('', [Validators.required]),
			slug: new FormControl('', [Validators.required], [this.slugValidator()]),
			excerpt: new FormControl(''),
			htmlContent: new FormControl('')
		});
	}

	ngOnInit(): void {
		this.admin.getPageCount().toPromise().then(count => {
			this.pageCount = count;
		});
		this.fetchPages();
	}

	newPage(): void {
		if (this.newPageGroup.valid) {
			const page: Page = {
				title: this.newPageGroup.get('title')!.value,
				slug: this.newPageGroup.get('slug')!.value,
				excerpt: this.newPageGroup.get('excerpt')!.value,
				content: this.newPageGroup.get('htmlContent')!.value
			}
			if (page.slug!.substr(0, 1) !== '/') {
				page.slug = '/' + page.slug;
			}
			this.admin.submitPage(page).toPromise().then(page => {
				this.pages.unshift(page);
			})
		}
	}

	get shownPages(): Page[] {
		const index = this.pagePageEvent.pageIndex;
		const size = this.pagePageEvent.pageSize;
		return this.pages.slice(index * size, index * size + size);
	}

	fetchPages(event?: PageEvent): void {
		if (event) {
			this.pagePageEvent = event;
		}
		this.loaded = false;
		this.admin.getAllPages(this.pagePageEvent.pageIndex, this.pagePageEvent.pageSize).toPromise().then(pages => {
			this.pages = this.pages.concat(pages);
			this.loaded = true;
		}).catch(err => this.loaded = true);
	}

	get slug(): FormControl {
		return this.newPageGroup.get('slug')! as FormControl;
	}

	private slugValidator(): AsyncValidatorFn {
		return (control: AbstractControl): Observable<ValidationErrors | null> => {
			return this.admin.checkPageSlugTaken(control.value).pipe(
				debounceTime(500),
				take(1),
				map(res => !res ? { slugTaken: true } : null)
			);
		};
	}

}
