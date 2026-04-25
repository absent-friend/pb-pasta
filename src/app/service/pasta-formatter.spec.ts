import { TestBed } from '@angular/core/testing';

import { PastaFormatter } from './pasta-formatter';

describe('PastaFormatter', () => {
  let service: PastaFormatter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PastaFormatter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
