// stagiaire.guard.ts
import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthService} from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class StagiaireGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
    ){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {

    const user = this.authService.getCurrentUser();


    // Vérifier si l'utilisateur est connecté
    if (!this.authService.isAuthenticated()) {
      console.log('❌ Utilisateur non connecté - Redirection vers login');
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    // Vérifier si l'utilisateur est un stagiaire
    if (!this.authService.isStagiaire()) {
      console.log('❌ Utilisateur non autorisé - Pas un stagiaire');

      // Rediriger selon le rôle
      if (this.authService.isAdmin()) {
        this.router.navigate(['/dashboard-admin'], {});
      } else {
        this.router.navigate(['/unauthorized']);
      }
      return false;
    }

    // Vérifier si le compte est actif
    if (user && 'enabled' in user && !user.enabled) {
      console.log('❌ Compte stagiaire inactif');
      this.router.navigate(['/account-inactive']);
      return false;
    }

    // Vérifier si c'est la première connexion
    if (user && 'premiereConnexion' in user && user.premiereConnexion) {
      console.log('🔄 Première connexion détectée - Redirection changement mot de passe');
      this.router.navigate(['/change-password']);
      return false;
    }

    console.log('✅ Accès autorisé pour le stagiaire:', user?.firstName, user?.lastName);
    return true;
  }
}
