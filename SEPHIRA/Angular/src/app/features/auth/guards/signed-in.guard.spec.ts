import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CookieService } from 'src/app/core/services/cookie/cookie.service';

import { SignedInGuard } from './signed-in.guard';

describe('SignedInGuard', () => {
	let guard: SignedInGuard;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule],
			providers: [CookieService],
		});
		guard = TestBed.inject(SignedInGuard);
	});

	it('should be created', () => {
		expect(guard).toBeTruthy();
	});
});
