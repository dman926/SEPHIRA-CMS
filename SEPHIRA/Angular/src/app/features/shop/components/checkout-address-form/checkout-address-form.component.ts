import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
	selector: 'sephira-checkout-address-form',
	templateUrl: './checkout-address-form.component.html',
	styleUrls: ['./checkout-address-form.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class CheckoutAddressFormComponent {

	@Input() formGroup: FormGroup | undefined;
	@Input() allowBack: boolean;

	@Output() previous: EventEmitter<undefined>;
	@Output() next: EventEmitter<undefined>;

	constructor() {
		this.allowBack = false;
		this.previous = new EventEmitter<undefined>();
		this.next = new EventEmitter<undefined>();
	}

}
