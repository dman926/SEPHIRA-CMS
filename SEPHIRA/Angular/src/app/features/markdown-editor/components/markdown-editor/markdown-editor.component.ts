import { Component, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormGroupDirective, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
	selector: 'sephira-markdown-editor',
	templateUrl: './markdown-editor.component.html',
	styleUrls: ['./markdown-editor.component.scss'],
})
export class MarkdownEditorComponent implements OnInit, OnDestroy {

	@Input() controlName?: string;
	@Input() label?: string;
	@Input() data?: string;

	private formControlSub?: Subscription

	constructor(@Optional() public rootFormGroup: FormGroupDirective) { }

	ngOnInit(): void {
		if (this.controlName) {
			const control = this.rootFormGroup.control.get(this.controlName);
			if (!control) {
				throw new Error('`' + this.controlName + '` is not a valid FormControl in the parent FormGroup.');
			}
		}
	}

	ngOnDestroy(): void {
		this.formControlSub?.unsubscribe();
	}

	get isRequired(): boolean {
		if (this.controlName) {
			return this.rootFormGroup.control.get(this.controlName)!.hasValidator(Validators.required);
		}
		return false;
	}

}
