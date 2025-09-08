import {HttpInterceptorFn} from '@angular/common/http';

/**
 * Intercepteur HTTP qui ajoute automatiquement le token JWT aux requêtes sortantes.
 * Protection contre CSRF par authentification stateless Bearer Token.
 * Évite l'utilisation de cookies de session vulnérables aux attaques CSRF.
 */
export const jwtInterceptor: HttpInterceptorFn = (
  req,
  next) => {


  // Récupération sécurisée du token depuis le stockage local
  const jwt = localStorage.getItem("jwt")

  if (jwt) {

    // Clone de la requête avec ajout du header Authorization
    // Format Bearer Token standard pour l'authentification stateless
    const requeteAvecJwt = req.clone({
      setHeaders: {Authorization: "Bearer " + jwt}
    })
    return next(requeteAvecJwt);
  }
  return next(req);
};
