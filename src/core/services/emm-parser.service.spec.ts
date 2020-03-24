import { TestBed } from '@angular/core/testing';

import { EmmParserService } from './emm-parser.service';

describe('EmmParserService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EmmParserService = TestBed.get(EmmParserService);
    expect(service).toBeTruthy();
  });
});
