import { TestBed } from '@angular/core/testing';

import { InMemoryDbService } from './in-memory-db.service';

describe('InMemoryDbService', () => {
  let service: InMemoryDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InMemoryDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
