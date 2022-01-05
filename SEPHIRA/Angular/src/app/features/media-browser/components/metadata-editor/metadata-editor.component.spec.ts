import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MetadataEditorComponent } from './metadata-editor.component';

describe('MetadataEditorComponent', () => {
	let component: MetadataEditorComponent;
	let fixture: ComponentFixture<MetadataEditorComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			providers: [
				{ provide: MatDialogRef, useValue: {} },
				{
					provide: MAT_DIALOG_DATA,
					useValue: {
						media: {
							owner: '',
							folder: '',
							filename: '',
						},
					},
				},
			],
			declarations: [MetadataEditorComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(MetadataEditorComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
