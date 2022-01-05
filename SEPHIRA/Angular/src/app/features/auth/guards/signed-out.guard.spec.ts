import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CookieService } from 'src/app/core/services/cookie/cookie.service';

import { SignedOutGuard } from './signed-out.guard';

describe('SignedOutGuard', () => {
	let guard: SignedOutGuard;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule],
			providers: [CookieService],
		});
		guard = TestBed.inject(SignedOutGuard);
	});

	it('should be created', () => {
		expect(guard).toBeTruthy();
	});
});
