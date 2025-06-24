import { Routes } from '@angular/router';
import { AccueilComponent } from './pages/accueil/accueil.component';
import { ConnexionComponent } from './pages/auth/connexion/connexion.component';
import { Page404Component } from './pages/page404/page404.component';
import { EditStagiaireComponent } from './pages/edit-stagiaire/edit-stagiaire.component';
import { DossiersListComponent } from './pages/dossiers-list/dossiers-list.component';
import { DossierDetailComponent } from './pages/dossier-detail/dossier-detail.component';
import { PreconnexionComponent } from './pages/auth/preconnexion/preconnexion.component';
import { DashboardAdminComponent } from './pages/dashboard-admin/dashboard-admin.component';
import { DashboardStagiaireComponent } from './pages/dashboard-stagiaire/dashboard-stagiaire.component';
import { PopupChangementMdpComponent } from './pages/auth/popup-changement-mdp/popup-changement-mdp.component';

// Import des guards
import { connecteGuard } from './guards/connecte.guard';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { stagiaireGuard } from './guards/stagiaire.guard';

export const routes: Routes = [
  // 🌐 PAGES PUBLIQUES (sans authentification)
  {
    path: '',
    component: PreconnexionComponent
  },
  {
    path: 'connexion',
    component: ConnexionComponent
  },
  {
    path: 'inscription',
    component: PreconnexionComponent
  },

  // 🔐 PAGES PROTÉGÉES - Authentification requise
  {
    path: 'accueil',
    component: AccueilComponent,
    canActivate: [connecteGuard]
  },

  // 👨‍💼 PAGES ADMIN - Rôle admin requis
  {
    path: 'dashboard-admin',
    component: DashboardAdminComponent,
    canActivate: [adminGuard] // Utilise le nouveau guard spécialisé
  },
  {
    path: 'ajout-product',
    component: EditStagiaireComponent,
    canActivate: [adminGuard] // Supposé être une fonction admin
  },
  {
    path: 'dossiers',
    component: DossiersListComponent,
    canActivate: [adminGuard] // Supposé être une fonction admin
  },
  {
    path: 'dossier/:id',
    component: DossierDetailComponent,
    canActivate: [adminGuard] // Supposé être une fonction admin
  },

  // 🎓 PAGES STAGIAIRE - Rôle stagiaire requis
  {
    path: 'dashboard-stagiaire',
    component: DashboardStagiaireComponent,
    canActivate: [stagiaireGuard] // Utilise le nouveau guard spécialisé
  },

  // 🔑 PAGES SPÉCIALES - Authentification simple (pas de check première connexion)
  {
    path: 'changer-mdp',
    component: PopupChangementMdpComponent,
    canActivate: [authGuard] // Permet l'accès même en première connexion
  },

  // 🔄 REDIRECTIONS ET 404
  {
    path: '**',
    component: Page404Component
  }
];
