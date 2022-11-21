import { TestBed } from '@angular/core/testing';

import { TxnService } from './txn.service';

describe('TxnService', () => {
  let service: TxnService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TxnService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
