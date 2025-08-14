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
import { adminGuard } from './guards/admin.guard';

// Import du nouveau layout et guard
import { AuthenticatedLayoutComponent } from './layouts/authenticated-layout/authenticated-layout.component';
import { AuthGuard } from './guards/auth.guard';

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

      // === ROUTES STAGIAIRES === //
      {
        path: 'dashboard-stagiaire',
        component: DashboardStagiaireComponent
      },
      {
        path: 'document-upload',
        component: DocumentUploadComponent  // Permet aux stagiaires d'envoyer leurs documents requis
      },

      // === ROUTES ADMIN SEULEMENT === //
      {
        path: 'dashboard-admin',
        component: DashboardAdminComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'document-validation',
        component: DocumentValidationComponent,
        canActivate: [adminGuard]
      },

      // Routes pour les Dossiers (accessible selon les droits)
      {
        path: 'dossiers',
        component: DossiersListComponent // Peut être accessible aux deux rôles
      },
      {
        path: 'dossiers/nouveau',
        component: EditDossierComponent,
        canActivate: [adminGuard]  // ✅ SÉCURISÉ : Création réservée aux admins
      },
      {
        path: 'dossiers/:id',
        component: EditDossierComponent,
        canActivate: [adminGuard] // ✅ SÉCURISÉ : Édition réservée aux admins
      },
      {
        path: 'dossier/:id',
        component: DossierDetailComponent // Consultation possible pour tous
      },

      // Autres routes administratives
      {
        path: 'ajout-dossier',
        component: EditStagiaireComponent,
        canActivate: [adminGuard]  // ✅ SÉCURISÉ : Admin uniquement
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
