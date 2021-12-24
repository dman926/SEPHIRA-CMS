import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface Data {
	content: string;
	cancelText: string;
	confirmText: string;
}

@Component({
	selector: 'sephira-confirm-dialog',
	templateUrl: './confirm-dialog.component.html',
	styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent {
	
	constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: Data) {
		if (!this.data.content) {
			this.data.content = 'Are you sure?';
		}
		if (!this.data.cancelText) {
			this.data.cancelText = 'Cancel';
		}
		if (!this.data.confirmText) {
			this.data.confirmText = 'Confirm';
		}
	}

}
