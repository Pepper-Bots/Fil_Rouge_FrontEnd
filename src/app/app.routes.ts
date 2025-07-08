import { Routes } from '@angular/router';
import { AccueilComponent } from './pages/accueil/accueil.component';
import { ConnexionComponent } from './pages/auth/connexion/connexion.component';
import { Page404Component } from './pages/page404/page404.component';
import { EditStagiaireComponent } from './pages/edit-stagiaire/edit-stagiaire.component';
import { DossiersListComponent } from './pages/dossiers-list/dossiers-list.component';
import { DossierDetailComponent } from './pages/dossier-detail/dossier-detail.component';
import { PreconnexionComponent } from './pages/auth/preconnexion/preconnexion.component';
import { DashboardStagiaireComponent } from './pages/dashboard-stagiaire/dashboard-stagiaire.component';
import { DashboardAdminComponent } from './pages/dashboard-admin/dashboard-admin.component';
import { connecteGuard } from './services/connecte.guard';
import { EditDossierComponent } from './pages/edit-dossier/edit-dossier.component';

export const routes: Routes = [
  // Route racine - redirige vers preconnexion
  { path: '', redirectTo: '/preconnexion', pathMatch: 'full' },

  // Pages publiques (sans guard)
  { path: 'preconnexion', component: PreconnexionComponent },
  { path: 'connexion', component: ConnexionComponent },
  { path: 'inscription', component: PreconnexionComponent },

  // Pages protégées par le guard
  {
    path: 'accueil',
    component: AccueilComponent,
    canActivate: [connecteGuard]
  },
  {
    path: 'dashboard-stagiaire',
    component: DashboardStagiaireComponent,
    canActivate: [connecteGuard]
  },

  {
    path: 'dashboard-admin',
    component: DashboardAdminComponent,
    canActivate: [connecteGuard]
  },

  // Routes pour les dossiers
  {
    path: 'dossiers',
    component: DossiersListComponent,
    canActivate: [connecteGuard]
  },
  {
    path: 'dossiers/nouveau',
    component: EditDossierComponent,
    canActivate: [connecteGuard]
  },
  {
    path: 'dossiers/:id',
    component: EditDossierComponent,
    canActivate: [connecteGuard]
  },
  {
    path: 'dossier/:id',
    component: DossierDetailComponent,
    canActivate: [connecteGuard]
  },

  // Autres routes protégées
  {
    path: 'ajout-dossier',
    component: EditStagiaireComponent,
    canActivate: [connecteGuard]
  },

  // Route 404 - DOIT ÊTRE EN DERNIER
  { path: '**', component: Page404Component }
];
