import { TestBed } from '@angular/core/testing';

import { FloatingImageService } from './floating-image.service';

describe('FloatingImageService', () => {
  let service: FloatingImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FloatingImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
