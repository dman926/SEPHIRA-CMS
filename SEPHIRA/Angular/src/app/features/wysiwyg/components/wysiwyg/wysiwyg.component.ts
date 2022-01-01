import { Component, Input, OnDestroy, OnInit, SecurityContext } from '@angular/core';
import { FormControl, FormGroupDirective } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Editor, Toolbar } from 'ngx-editor';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'sephira-wysiwyg',
	templateUrl: './wysiwyg.component.html',
	styleUrls: ['./wysiwyg.component.scss']
})
export class WysiwygComponent implements OnInit, OnDestroy {

	@Input() controlName: string | undefined;
	@Input() label: string | undefined;
	@Input() floatingMenu: boolean;
	@Input() placeholder: string;
	@Input() disableCodeEditing: boolean;
	@Input() sanitize: boolean;

	_editor: Editor | undefined;
	_codeEditor: boolean;

	readonly _toolbar: Toolbar = [
		// default value
		['bold', 'italic'],
		['underline', 'strike'],
		['code', 'blockquote'],
		['ordered_list', 'bullet_list'],
		[{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
		['link', 'image'],
		['text_color', 'background_color'],
		['align_left', 'align_center', 'align_right', 'align_justify'],
	];

	constructor(public theme: ThemeService, public rootFormGroup: FormGroupDirective, private sanitizer: DomSanitizer) {
		this.floatingMenu = environment.wysiwygMenuStyle === 'floating';
		this.placeholder = 'Type Here...';
		this.disableCodeEditing = false;
		this.sanitize = true;
		this._codeEditor = false;
	}

	ngOnInit(): void {
		if (this.controlName === undefined) {
			throw new Error('`controlName` is a required input');
		}
		let control = this.rootFormGroup.control.get(this.controlName);
		if (control) {
			if (this.sanitize) {
				control.valueChanges.subscribe(val => {
					control?.setValue(this.sanitizer.sanitize(SecurityContext.HTML, this.sanitizer.bypassSecurityTrustHtml(val))?.toString(), {
						emitEvent: false
					});
				});
			}
		} else {
			throw new Error('Supplied control name is not a valid `FormControl`');
		}
		this._editor = new Editor();
	}

	ngOnDestroy(): void {
		this._editor?.destroy();
	}

	get editor(): Editor | undefined {
		return this._editor;
	}

}
