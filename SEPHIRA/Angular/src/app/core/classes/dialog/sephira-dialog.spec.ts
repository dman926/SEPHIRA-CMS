import { TestBed } from '@angular/core/testing';
import {
	MatDialogModule,
	MatDialogRef,
	MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { SephiraDialog } from './sephira-dialog';

describe('SephiraDialog', () => {
	let dialog: SephiraDialog;

	beforeEach(async () => {
		TestBed.configureTestingModule({
			imports: [MatDialogModule],
			providers: [
				SephiraDialog,
				{ provide: MatDialogRef, useValue: {} },
				{ provide: MAT_DIALOG_DATA, useValue: {} },
			],
		});
		dialog = TestBed.inject(SephiraDialog);
	});

	it('should create an instance', () => {
		expect(dialog).toBeTruthy();
	});
});
