import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormArray, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { AdminService } from 'src/app/admin/servies/admin.service';
import { CoreService } from 'src/app/core/services/core/core.service';
import { PlatformService } from 'src/app/core/services/platform/platform.service';
import { Post, PostSchema } from 'src/app/models/posts/post';

@Component({
	selector: 'sephira-post',
	templateUrl: './post.component.html',
	styleUrls: ['./post.component.scss'],
})
export class PostComponent implements OnInit {

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

	constructor(private admin: AdminService, private core: CoreService, private router: Router, private route: ActivatedRoute, private platform: PlatformService) {
		this.saving = false;
		this.saved = false;
		this.loaded = false;
	}

	ngOnInit(): void {
		if (this.platform.isBrowser) {
			this.route.parent!.params.subscribe(params => {
				this.postType = params['postType'];
				if (!this.postType) {
					this.router.navigate(['../'], {relativeTo: this.route});
				}
				this.route.params.subscribe(params => {
					this.id = params['id'];
					if (!this.id) {
						this.router.navigate(['../'], {relativeTo: this.route});
					}
					this.admin.getPost(this.postType!, this.id!, true).subscribe(post => {
						this.createForm(post.obj, post.schema!);
					});
				});
			});
		}	
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
			asyncValidators.push(this.core.slugValidator(this.postType!, this.id));
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

}
