import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { CoreService } from 'src/app/core/services/core/core.service';

import { FileService } from './file.service';

describe('MediaService', () => {
	let service: FileService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [CoreService],
		});
		service = TestBed.inject(FileService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
