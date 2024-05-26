import { TestBed } from '@angular/core/testing';

import { NgxSimpleStateService } from './ngx-simple-state.service';

describe('NgxSimpleStateService', () => {
  let service: NgxSimpleStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxSimpleStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
