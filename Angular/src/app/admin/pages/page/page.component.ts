import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Subscription, Observable, of } from 'rxjs';
import { debounceTime, take, map } from 'rxjs/operators';
import { Page } from 'src/app/models/page';
import { AdminService } from '../../admin.service';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit, OnDestroy {

	page: Page | undefined;

	pageGroup: FormGroup;
	saving: boolean;
	saved: boolean;

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

	private subs: Subscription[];

	constructor(private adminService: AdminService, private route: ActivatedRoute, private router: Router) {
		this.subs = [];
		this.pageGroup = new FormGroup({
			title: new FormControl('', [Validators.required]),
			slug: new FormControl('', [Validators.required], [this.slugValidator()]),
			content: new FormControl(''),
			excerpt: new FormControl(''),
			status: new FormControl(''),
			categories: new FormArray([])
		});
		this.saving = false;
		this.saved = false;
	}

	ngOnInit(): void {
		this.subs.push(this.route.params.subscribe(params => {
			this.adminService.getPage(params.id).toPromise().then(page => {
				this.page = page;
				this.pageGroup.patchValue({
					title: page.title,
					slug: page.slug,
					content: page.content,
					excerpt: page.excerpt,
					status: page.status,
					categories: page.categories!.map(cat => new FormControl(cat, [Validators.required]))
				});
			}).catch(err => this.router.navigate(['/admin/pages']));
		}));
	}

	ngOnDestroy(): void {
		this.subs.forEach(sub => sub.unsubscribe());
	}

	deletePage(): void {
		if (this.page) {
			this.adminService.deletePage(this.page.id!).toPromise().then(res => this.router.navigate(['/admin/pages']));
		}
	}

	editPage(): void {
		if (this.page && this.pageGroup.valid) {
			const page: Page = {
				id: this.page.id,
				title: this.pageGroup.get('title')!.value,
				slug: this.pageGroup.get('slug')!.value,
				content: this.pageGroup.get('content')!.value,
				excerpt: this.pageGroup.get('excerpt')!.value,
				status: this.pageGroup.get('status')!.value,
				categories: this.pageGroup.get('categories')!.value,
			};
			this.saving = true;
			this.adminService.editPage(page).toPromise().then(res => {
				this.saving = false;
				this.saved = true;
				setTimeout(() => {
					this.saved = false;
				}, 3000);
			});
		}
	}

	addCategory(): void {
		if (this.categoriesArray.length < 20) {
			this.categoriesArray.push(new FormControl('', Validators.required));
		}
	}

	removeCategory(): void {
		this.categoriesArray.removeAt(this.categoriesArray.length - 1);
	}

	deleteProduct(): void {
		if (this.page) {
			this.adminService.deleteProduct(this.page.id!).toPromise().then(res => {
				this.router.navigate(['/admin/pages']);
			})
		}
	}

	get slug(): FormControl {
		return this.pageGroup.get('slug')! as FormControl;
	}

	get categoriesArray() {
		return this.pageGroup.get('categories')! as FormArray;
	}

	private slugValidator(): AsyncValidatorFn {
		return (control: AbstractControl): Observable<ValidationErrors | null> => {
			if (this.page?.slug === control.value) {
				return of(null)
			} else {
				return this.adminService.checkPageSlugTaken(control.value).pipe(
					debounceTime(500),
					take(1),
					map(res => !res ? { slugTaken: true } : null)
				);
			}
		};
	}

}
