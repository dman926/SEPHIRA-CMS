import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { CookieService } from '../cookie/cookie.service';

import { CoreService } from './core.service';

describe('CoreService', () => {
  let service: CoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
		imports: [HttpClientModule],
		providers: [CookieService]
	});
    service = TestBed.inject(CoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
