import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
	selector: 'sephira-create-folder-dialog',
	templateUrl: './create-folder-dialog.component.html',
	styleUrls: ['./create-folder-dialog.component.scss'],
})
export class CreateFolderDialogComponent {

	folderFormGroup: FormGroup;

	constructor(public dialogRef: MatDialogRef<CreateFolderDialogComponent>) {
		this.folderFormGroup = new FormGroup({
			folder: new FormControl('', [Validators.required])
		});
	}

	onSubmit(): void {
		if (this.folderFormGroup.valid) {
			this.dialogRef.close(this.folderFormGroup.get('folder')!.value);
		}
	}

}
