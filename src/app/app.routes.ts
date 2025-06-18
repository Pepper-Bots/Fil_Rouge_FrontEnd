import { Routes } from '@angular/router';
import { AccueilComponent } from './pages/accueil/accueil.component';
import { ConnexionComponent } from './pages/auth/connexion/connexion.component';
import { Page404Component } from './pages/page404/page404.component';
import { EditStagiaireComponent } from './pages/edit-stagiaire/edit-stagiaire.component';
import {DossiersListComponent} from './pages/dossiers-list/dossiers-list.component';
import {DossierDetailComponent} from './pages/dossier-detail/dossier-detail.component';
import { PreconnexionComponent } from './pages/auth/preconnexion/preconnexion.component';
import { DashboardAdminComponent } from './pages/dashboard-admin/dashboard-admin.component';
import {DashboardStagiaireComponent} from './pages/dashboard-stagiaire/dashboard-stagiaire.component';
import {connecteGuard} from './services/connecte.guard';
import {PopupChangementMdpComponent} from './pages/auth/popup-changement-mdp/popup-changement-mdp.component';


export const routes: Routes = [

  { path: '', component: PreconnexionComponent }, // page d'accueil avant connexion
  { path: 'accueil', component: AccueilComponent, canActivate: [connecteGuard] }, // accueil connecté (dashboard)
  { path: 'connexion', component: ConnexionComponent },
  { path: 'inscription', component: PreconnexionComponent },
  { path: 'ajout-product', component: EditStagiaireComponent },
  { path: 'dossiers', component: DossiersListComponent },
  { path: 'dossier/:id', component: DossierDetailComponent },
  { path: 'dashboard-stagiaire', component: DashboardStagiaireComponent, canActivate: [connecteGuard] },
  { path: 'dashboard-admin', component: DashboardAdminComponent, canActivate: [connecteGuard] },
  { path: 'changer-mdp', component: PopupChangementMdpComponent },
  // Exemple de config de routes :
  { path: 'dashboard-admin', component: DashboardAdminComponent, canActivate: [RoleGuard], data: { role: 'ROLE_ADMIN' } },
  { path: 'dashboard-stagiaire', component: DashboardStagiaireComponent, canActivate: [RoleGuard], data: { role: 'ROLE_STAGIAIRE' } },
  { path: '', redirectTo: 'accueil', pathMatch: 'full' },
  { path: '**', component: Page404Component },

];
