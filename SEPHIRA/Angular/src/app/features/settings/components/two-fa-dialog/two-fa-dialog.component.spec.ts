import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from 'src/app/features/auth/services/auth/auth.service';

import { TwoFaDialogComponent } from './two-fa-dialog.component';

describe('TwoFaDialogComponent', () => {
	let component: TwoFaDialogComponent;
	let fixture: ComponentFixture<TwoFaDialogComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				RouterTestingModule,
				BrowserTransferStateModule,
			],
			providers: [AuthService, { provide: MatDialogRef, useValue: {} }],
			declarations: [TwoFaDialogComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TwoFaDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
