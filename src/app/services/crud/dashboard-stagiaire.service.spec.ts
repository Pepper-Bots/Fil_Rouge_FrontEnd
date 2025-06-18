import { TestBed } from '@angular/core/testing';

import { DashboardStagiaireService } from './dashboard-stagiaire.service';

describe('DashboardStagiaireService', () => {
  let service: DashboardStagiaireService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardStagiaireService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
