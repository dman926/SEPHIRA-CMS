import { Component } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

@Component({
	selector: 'sephira-media',
	templateUrl: './media.component.html',
	styleUrls: ['./media.component.scss'],
})
export class MediaComponent {

	dummyFormGroup: FormGroup;

	constructor() {
		this.dummyFormGroup = new FormGroup({
			dummy: new FormArray([])
		});
	}

}
