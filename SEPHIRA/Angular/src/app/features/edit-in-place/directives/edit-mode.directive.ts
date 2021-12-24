import { Directive, TemplateRef } from '@angular/core';

@Directive({
	selector: '[sephiraEditMode]',
})
export class EditModeDirective {

	constructor(public tpl: TemplateRef<any>) {}

}
