// src/app/guards/stagiaire.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Guard qui vérifie l'authentification ET le rôle stagiaire.
 * Redirige selon le statut d'authentification et le rôle.
 */
export const stagiaireGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  console.log('StagiaireGuard - isAuthenticated:', auth.isAuthenticated(), 'role:', auth.getRole());

  // Vérifier d'abord l'authentification
  if (!auth.isAuthenticated()) {
    console.log('StagiaireGuard: Non authentifié -> /connexion');
    return router.parseUrl('/connexion');
  }

  // Connecté mais première connexion → on redirige vers /changer-mdp
  if (auth.premiereConnexion && state.url !== '/changer-mdp') {
    console.log('StagiaireGuard: Première connexion -> /changer-mdp');
    return router.parseUrl('/changer-mdp');
  }

  // Vérifier le rôle stagiaire
  if (auth.isStagiaire()) {
    console.log('StagiaireGuard: Accès stagiaire autorisé ✅');
    return true;
  }

  console.log('StagiaireGuard: Accès refusé ❌ -> Redirection selon rôle');

  // Redirection selon le rôle
  if (auth.isAdmin()) {
    return router.parseUrl('/dashboard-admin');
  } else {
    return router.parseUrl('/accueil');
  }
};
