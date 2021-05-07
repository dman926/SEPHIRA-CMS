import { TestBed } from '@angular/core/testing';

import { SpeechSynthesisService } from './speech-synthesis.service';

describe('SpeechSynthesisService', () => {
  let service: SpeechSynthesisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpeechSynthesisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
