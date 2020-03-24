import { TestBed } from '@angular/core/testing';

import { BleCommandService } from './ble-command.service';

describe('BleCommandService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BleCommandService = TestBed.get(BleCommandService);
    expect(service).toBeTruthy();
  });
});
