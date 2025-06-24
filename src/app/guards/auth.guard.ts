// src/app/guards/auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Guard qui vérifie l'authentification de base.
 * Redirige vers la page de connexion si l'utilisateur n'est pas connecté.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  console.log('AuthGuard - isAuthenticated:', auth.isAuthenticated(), 'role:', auth.getRole());

  // Vérifie uniquement le JWT (stateless, fiable)
  if (!auth.isAuthenticated()) {
    console.log('AuthGuard: Non authentifié -> /connexion');
    return router.parseUrl('/connexion');
  }

  console.log('AuthGuard: Authentifié ✅');
  return true;
};
