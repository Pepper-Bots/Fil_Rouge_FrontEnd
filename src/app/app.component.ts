// app.component.ts
import {Component, inject} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import {AuthService} from './services/auth.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'admin-mns-front';
  showSidebar = false; // Changé par défaut à false
  sidebarCollapsed = false;
  isAuthenticated = false;
  userRole = '';

  auth = inject(AuthService);
  router = inject(Router);

  constructor() {
    // Écoute les changements de route pour masquer/afficher la sidebar
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Pages SANS sidebar (pré-connexion et connexion)
      const pagesWithoutSidebar = [
        '/',
        '/connexion',
        '/inscription',
        '/changer-mdp'
      ];

      this.showSidebar = !pagesWithoutSidebar.includes(event.url) && this.auth.isAuthenticated();

      // Vérifier l'état d'authentification
      this.checkAuthStatus();
    });

    // Vérification initiale
    this.checkAuthStatus();
  }

  // Vérifier le statut de connexion
  private checkAuthStatus() {
    this.isAuthenticated = this.auth.isAuthenticated();
    if (this.isAuthenticated) {
      this.userRole = this.auth.getRole() || '';
      // Forcer l'affichage de la sidebar si connecté (sauf sur pages exclues)
      const currentUrl = this.router.url;
      const pagesWithoutSidebar = ['/', '/connexion', '/inscription', '/changer-mdp'];
      if (!pagesWithoutSidebar.includes(currentUrl)) {
        this.showSidebar = true;
      }
    } else {
      this.showSidebar = false;
      this.userRole = '';
    }
  }

  // Toggle sidebar (ouvrir/fermer)
  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  // Déconnexion
  logout() {
    this.auth.logout();
    this.isAuthenticated = false;
    this.userRole = '';
    this.showSidebar = false;
    this.router.navigate(['/']);
  }

  // Lien dashboard selon le rôle
  get dashboardLink() {
    switch(this.userRole.toUpperCase()) {
      case 'ADMIN': return '/dashboard-admin';
      case 'STAGIAIRE': return '/dashboard-stagiaire';
      default: return '/accueil';
    }
  }
}
