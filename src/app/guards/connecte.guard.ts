import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * Guard qui empêche l'accès aux pages si l'utilisateur n'est pas connecté.
 * Ergonomique : redirige vers la page de connexion si nécessaire.
 */
export const connecteGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  console.log('Guard - isAuthenticated:', auth.isAuthenticated(), 'role:', auth.getRole());

// Vérifie uniquement le JWT (stateless, fiable)
if (!auth.isAuthenticated()) {
    return router.parseUrl('/connexion');
  }

  // Connecté mais première connexion → on redirige vers /changer-mdp
  if (auth.premiereConnexion && state.url !== '/changer-mdp') {
    return router.parseUrl('/changer-mdp');
  }

  return true;
};


// service Angular guard qui protège certaines routes selon que l’utilisateur est authentifié ou non.
