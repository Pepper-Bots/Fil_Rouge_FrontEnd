// src/app/guards/admin.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Guard qui vérifie l'authentification ET le rôle admin.
 * Redirige selon le statut d'authentification et le rôle.
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  console.log('AdminGuard - isAuthenticated:', auth.isAuthenticated(), 'role:', auth.getRole());

  // Vérifier d'abord l'authentification
  if (!auth.isAuthenticated()) {
    console.log('AdminGuard: Non authentifié -> /connexion');
    return router.parseUrl('/connexion');
  }

  // Connecté mais première connexion → on redirige vers /changer-mdp
  if (auth.premiereConnexion && state.url !== '/changer-mdp') {
    console.log('AdminGuard: Première connexion -> /changer-mdp');
    return router.parseUrl('/changer-mdp');
  }

  // Vérifier le rôle admin
  if (auth.isAdmin()) {
    console.log('AdminGuard: Accès admin autorisé ✅');
    return true;
  }

  console.log('AdminGuard: Accès refusé ❌ -> Redirection selon rôle');

  // Redirection selon le rôle
  if (auth.isStagiaire()) {
    return router.parseUrl('/dashboard-stagiaire');
  } else {
    return router.parseUrl('/accueil');
  }
};
