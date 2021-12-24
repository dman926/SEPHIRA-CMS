import { Directive, TemplateRef } from '@angular/core';

@Directive({
	selector: '[sephiraViewMode]',
})
export class ViewModeDirective {
	
	constructor(public tpl: TemplateRef<any>) {}

}
