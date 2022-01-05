import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { CoreService } from 'src/app/core/services/core/core.service';

import { AdminService } from './admin.service';

describe('AdminService', () => {
	let service: AdminService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [CoreService],
		});
		service = TestBed.inject(AdminService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
