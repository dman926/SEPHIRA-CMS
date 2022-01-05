import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { CoreService } from 'src/app/core/services/core/core.service';

import { CheckoutService } from './checkout.service';

describe('CheckoutService', () => {
	let service: CheckoutService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [CoreService],
		});
		service = TestBed.inject(CheckoutService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
