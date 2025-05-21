import { Routes } from '@angular/router';
import { AccueilComponent } from './pages/accueil/accueil.component';
import { ConnexionComponent } from './auth/connexion/connexion.component';
import { Page404Component } from './pages/page404/page404.component';
import { EditStagiaireComponent } from './pages/edit-stagiaire/edit-stagiaire.component';
import {DossiersListComponent} from './pages/dossiers-list/dossiers-list.component';
import {DossierDetailComponent} from './pages/dossier-detail/dossier-detail.component';
// import {DossierFormComponent} from './pages/affichage-liste-dossiers/dossier-form.component';
import { PreconnexionComponent } from './auth/preconnexion/preconnexion.component';


export const routes: Routes = [
  { path: '', component: PreconnexionComponent }, // page d'accueil avant connexion
  { path: 'accueil', component: AccueilComponent }, // accueil connecté (dashboard)
  { path: 'connexion', component: ConnexionComponent },
  //{ path: 'inscription', component: InscriptionComponent },
  { path: 'ajout-product', component: EditStagiaireComponent },
  { path: '', redirectTo: 'accueil', pathMatch: 'full' },
  { path: '**', component: Page404Component },
  { path: 'dossiers', component: DossiersListComponent },
  { path: 'dossier/:id', component: DossierDetailComponent },
  // { path: 'dossier-form/:id', component: DossierFormComponent },
];
