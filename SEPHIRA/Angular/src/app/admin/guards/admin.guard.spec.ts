import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminService } from '../services/admin.service';

import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
	let guard: AdminGuard;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				RouterTestingModule,
				HttpClientModule,
				BrowserTransferStateModule,
			],
			providers: [AdminService],
		});
		guard = TestBed.inject(AdminGuard);
	});

	it('should be created', () => {
		expect(guard).toBeTruthy();
	});
});
