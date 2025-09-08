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
import { DocumentValidationComponent } from './pages/document-validation/document-validation.component';
import { DocumentUploadComponent } from './pages/document-upload/document-upload.component';
import { AdminGuard } from './guards/admin.guard';

// Import du nouveau layout et guard
import { AuthenticatedLayoutComponent } from './layouts/authenticated-layout/authenticated-layout.component';
import { AuthGuard } from './guards/auth.guard';
import {ProfileComponent} from './pages/profile/profile.component';
import {StagiaireGuard} from './guards/stagiaire.guard';

export const routes: Routes = [
  // Route racine - redirige vers preconnexion
  { path: '', redirectTo: '/preconnexion', pathMatch: 'full' },

  // Pages publiques (sans guard ni layout)
  { path: 'preconnexion', component: PreconnexionComponent },
  { path: 'connexion', component: ConnexionComponent },
  { path: 'inscription', component: PreconnexionComponent },

  // === ROUTES AVEC LAYOUT AUTHENTIFIÉ === //
  {
    path: '',
    component: AuthenticatedLayoutComponent,
    canActivate: [AuthGuard], // ou connecteGuard selon votre préférence
    children: [
      // Pages communes à tous les utilisateurs connectés
      {
        path: 'accueil',
        component: AccueilComponent
      },
      {
        path: 'dossiers',
        component: DossiersListComponent,
        canActivate: [AuthGuard],

      },

      // === ROUTES STAGIAIRES === //
      {
        path: 'dashboard-stagiaire',
        component: DashboardStagiaireComponent,
        canActivate: [StagiaireGuard],
        data: {title: 'Mon espace stagiaire'}
      },
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [StagiaireGuard],
        data: {title: 'Mon profil'}
      },
      {
        path: 'document-upload',
        component: DocumentUploadComponent,  // Permet aux stagiaires d'envoyer leurs documents requis
        canActivate: [StagiaireGuard],
        data: {title: 'Envoi de documents'}
      },

      // === ROUTES ADMIN SEULEMENT === //
      {
        path: 'dashboard-admin',
        component: DashboardAdminComponent,
        canActivate: [AdminGuard],
        data: {title: 'Dashboard Administrateur'}
      },
      {
        path: 'document-validation',
        component: DocumentValidationComponent,
        canActivate: [AdminGuard],
        data: {title: 'Validation des documents'}
      },

      // Routes pour les Dossiers (accessible selon les droits)
      {
        path: 'dossiers',
        component: DossiersListComponent, // Peut être accessible aux deux rôles
        canActivate: [AdminGuard],
        data: {title: 'Liste des dossiers'}
      },
      {
        path: 'dossiers/nouveau',
        component: EditDossierComponent,
        canActivate: [AdminGuard],  // ✅ SÉCURISÉ : Création réservée aux admins
        data: {title: 'Nouveau dossier'}
      },
      {
        path: 'dossiers/:id',
        component: EditDossierComponent,
        canActivate: [AdminGuard], // ✅ SÉCURISÉ : Édition réservée aux admins
        data: {title: 'Edition du dossier'}
      },
      {
        path: 'dossier/:id',
        component: DossierDetailComponent, // Consultation possible pour tous
        data: {title: 'Détail du dossier'}
      },

      // Autres routes administratives
      {
        path: 'ajout-dossier',
        component: EditStagiaireComponent,
        canActivate: [AdminGuard],  // ✅ SÉCURISÉ : Admin uniquement
        data: {title: 'Ajout de stagiaire'}
      },

      // === ROUTES SUPER ADMIN === //
      // Exemple : gestion des utilisateurs, paramètres système, etc.
      // {
      //   path: 'admin/users',
      //   component: UserManagementComponent,
      //   canActivate: [superAdminGuard]  // ✅ SÉCURISÉ : Super Admin uniquement
      // },
    ]
  },

  // Route 404 - DOIT ÊTRE EN DERNIER
  { path: '**', component: Page404Component }
];
