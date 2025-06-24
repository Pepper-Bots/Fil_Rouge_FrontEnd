import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { stagiaireGuard } from './stagiaire.guard';

describe('stagiaireGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => stagiaireGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
