import { TestBed } from '@angular/core/testing';

import { RunParser } from './run-parser';

describe('RunParser', () => {
  let service: RunParser;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RunParser);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
