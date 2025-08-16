import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service'

/**
 * Guard qui empêche l'accès aux pages admin si l'utilisateur n'est pas un administrateur.
 * Sécurise les routes réservées aux ADMIN et SUPER_ADMIN.
 */
export const AdminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // 1. Vérifier d'abord si l'utilisateur est connecté
  if (!auth.connecte || !auth.isAuthenticated()) {
    console.warn('🚫 adminGuard: Utilisateur non connecté');
    return router.parseUrl('/connexion');
  }

  // 2. Vérifier si c'est sa première connexion
  if (auth.premiereConnexion && state.url !== '/changer-mdp') {
    console.warn('🚫 adminGuard: Première connexion, redirection changement mdp');
    return router.parseUrl('/changer-mdp');
  }

  // 3. Vérifier le rôle administrateur
  if (!auth.isAdmin()) {
    console.warn('🚫 adminGuard: Accès refusé - Rôle insuffisant:', auth.getRole());

    // Rediriger selon le rôle
    const role = auth.getRole();
    if (role === 'STAGIAIRE') {
      return router.parseUrl('/dashboard-stagiaire');
    }

    // Fallback vers accueil
    return router.parseUrl('/accueil');
  }

  console.log('✅ adminGuard: Accès autorisé pour', auth.getRole());
  return true;
};

/**
 * Guard spécialisé pour les Super Admin uniquement
 */
export const superAdminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Réutiliser la logique de base d'adminGuard
  const adminAccess = AdminGuard(route, state);
  if (typeof adminAccess !== 'boolean') {
    return adminAccess; // Redirection déjà gérée
  }

  // Vérification Super Admin spécifique
  if (!auth.isSuperAdmin()) {
    console.warn('🚫 superAdminGuard: Accès refusé - Super Admin requis');
    return router.parseUrl('/dashboard-admin'); // Redirection vers dashboard admin normal
  }

  console.log('✅ superAdminGuard: Accès Super Admin autorisé');
  return true;
};
