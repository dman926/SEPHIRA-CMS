import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, take, map } from 'rxjs/operators';
import { PlatformService } from 'src/app/core/services/platform.service';
import { Post } from 'src/app/models/post';
import { PostSchema } from 'src/app/models/post-schema';
import { AdminService } from '../../admin.service';

@Component({
	selector: 'app-post',
	templateUrl: './post.component.html',
	styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit, OnDestroy {

	postFormGroup: FormGroup | undefined;
	postData: Post | undefined;
	schemas: PostSchema[] | undefined;
	saving: boolean;
	saved: boolean;
	loaded: boolean;

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

	private id: string | undefined;
	private postType: string | undefined;
	private paramsSub: Subscription | undefined;
	private parentParamsSub: Subscription | undefined;

	constructor(private router: Router, private route: ActivatedRoute, private platform: PlatformService, private admin: AdminService) {
		this.saving = false;
		this.saved = false;
		this.loaded = false;
	}

	ngOnInit(): void {
		if (this.platform.isBrowser()) {
			this.parentParamsSub = this.route.parent!.params.subscribe(params => {
				this.postType = params.postType;
				if (!this.postType) {
					this.router.navigate(['../'], {relativeTo: this.route});
				}
				this.paramsSub = this.route.params.subscribe(params => {
					this.id = params.id;
					if (!this.id) {
						this.router.navigate(['../'], {relativeTo: this.route});
					}
					this.admin.getPost(this.postType!, this.id!, true).toPromise().then(post => {
						this.createForm(post.obj, post.schema!);
					});
				});
			});
		}	
	}

	ngOnDestroy(): void {
		this.paramsSub?.unsubscribe();
		this.parentParamsSub?.unsubscribe();
	}

	editPost(): void {
		if (this.postFormGroup!.valid) {
			const post: Post = this.postFormGroup!.value;
			post.id = this.id!;
			this.saving = true;
			this.admin.editPost(this.postType!, post).toPromise().then(res => {
				this.saved = true;
				this.saving = false;
				this.postData = post;
				setTimeout(() => this.saved = false, 3000);
			});
		}
	}

	deletePost(): void {
		this.admin.deletePost(this.postType!, this.id!).toPromise().then(res => {
			this.router.navigate(['../'], {relativeTo: this.route});
		});
	}

	addToFormArray(name: string, args: PostSchema): void {
		(this.postFormGroup!.get(name)! as FormArray).push(this.parseAbsControl(args, ''));
	}

	removeFromFormArray(name: string, index: number): void {
		(this.postFormGroup!.get(name)! as FormArray).removeAt(index);
	}

	getFormArrayControls(name: string): AbstractControl[] {
		return (this.postFormGroup!.get(name)! as FormArray).controls;
	}

	private createForm(post: Post, schemas: PostSchema[]): void {
		this.postData = post;
		this.schemas = schemas;
		this.postFormGroup = new FormGroup({});
		schemas.forEach(schema => {
			this.postFormGroup!.addControl(schema.name, this.parseAbsControl(schema, (post as any)[schema.name]));
		});
		this.loaded = true;
	}

	private parseAbsControl(schema: PostSchema, postVal: any): AbstractControl {
		let absControl: AbstractControl;
		const validators: ValidatorFn[] = [];
		if (schema.validators) {
			for (const key in schema.validators) {
				switch (key) {
					case 'required':
						validators.push(Validators.required);
						break;
					case 'pattern':
						validators.push(Validators.pattern(schema.validators.pattern!));
						break;
				}
			}
		}
		const asyncValidators: AsyncValidatorFn[] = [];
		if (schema.name === 'slug') {
			asyncValidators.push(this.slugValidator());
		}
		switch (schema.controlType) {
			case 'media-browser':
				absControl = new FormArray(postVal.map((val: any) => new FormControl(val, [Validators.required])), validators, asyncValidators);
				break;
			case 'FormArray':
				absControl = new FormArray(postVal.map((val: any) => this.parseAbsControl(schema.array!, val)), validators, asyncValidators);
				break;
			case 'post-select':
				absControl = new FormArray(postVal.map((val: any) => new FormControl(val)), validators, asyncValidators);
				break;
			default:
				absControl = new FormControl(postVal, validators, asyncValidators);
		}
		return absControl!;
	}

	private slugValidator(): AsyncValidatorFn {
		return (control: AbstractControl): Observable<ValidationErrors | null> => {
			return this.admin.checkPostSlugTaken(this.postType!, control.value).pipe(
				debounceTime(500),
				take(1),
				map(res => (this.postData!.slug !== control.value && !res) ? { slugTaken: true } : null)
			);
		};
	}

}
