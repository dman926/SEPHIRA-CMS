import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';

import { CreateFolderDialogComponent } from './create-folder-dialog.component';

describe('CreateFolderDialogComponent', () => {
	let component: CreateFolderDialogComponent;
	let fixture: ComponentFixture<CreateFolderDialogComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			providers: [{ provide: MatDialogRef, useValue: {} }],
			declarations: [CreateFolderDialogComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CreateFolderDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
