import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { CoreService } from 'src/app/core/services/core/core.service';

import { ProductService } from './product.service';

describe('ProductService', () => {
	let service: ProductService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [CoreService],
		});
		service = TestBed.inject(ProductService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
