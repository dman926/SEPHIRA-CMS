import { Component } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
	selector: 'sephira-associated-media-dialog',
	templateUrl: './associated-media-dialog.component.html',
	styleUrls: ['./associated-media-dialog.component.scss'],
})
export class AssociatedMediaDialogComponent {

	childOfFormGroup: FormGroup;

	constructor(public dialogRef: MatDialogRef<AssociatedMediaDialogComponent>) {
		this.childOfFormGroup = new FormGroup({
			media: new FormArray([])
		});
	}

	get media(): FormArray {
		return this.childOfFormGroup.get('media')! as FormArray;
	}

}
