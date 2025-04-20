import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';

// Ici pas sécurité mais ergonomie pour l'utilisateur
// le but d'un guard est de nous empêcher d'aller sur certaines pages -> si true on peut aller sur les pages, si false on ne peut pas
export const connecteGuard: CanActivateFn = (route, state) => {

  const jwt = localStorage.getItem("jwt");

  if (jwt == null) {

    const router : Router = inject(Router);

    return router.parseUrl('/connexion')
  }

  return true;
};
