import { TestBed } from '@angular/core/testing';

import { EmmDataService } from './emm-data.service';

describe('EmmDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EmmDataService = TestBed.get(EmmDataService);
    expect(service).toBeTruthy();
  });
});
