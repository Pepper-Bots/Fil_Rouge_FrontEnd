import { CanActivateFn } from '@angular/router';

export const connecteGuard: CanActivateFn = (route, state) => {
  return true;
};
