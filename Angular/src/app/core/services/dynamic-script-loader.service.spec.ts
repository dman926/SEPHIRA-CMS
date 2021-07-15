import { TestBed } from '@angular/core/testing';

import { DynamicScriptLoaderService } from './dynamic-script-loader.service';

describe('DynamicScriptLoaderService', () => {
  let service: DynamicScriptLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DynamicScriptLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
