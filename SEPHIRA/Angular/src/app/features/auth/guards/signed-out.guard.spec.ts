import { TestBed } from '@angular/core/testing';

import { SignedOutGuard } from './signed-out.guard';

describe('SignedOutGuard', () => {
  let guard: SignedOutGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(SignedOutGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
