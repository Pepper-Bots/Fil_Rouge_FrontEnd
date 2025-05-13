import { Routes } from '@angular/router';
import { AccueilComponent } from './pages/accueil/accueil.component';
import { ConnexionComponent } from './pages/connexion/connexion.component';
import { Page404Component } from './pages/page404/page404.component';
import { EditStagiaireComponent } from './pages/edit-stagiaire/edit-stagiaire.component';
import {DossiersListComponent} from './pages/dossiers-list/dossiers-list.component';
import {DossierDetailComponent} from './pages/dossier-detail/dossier-detail.component';
import {DossierFormComponent} from './pages/affichage-liste-dossiers/dossier-form.component';

export const routes: Routes = [
  { path: 'accueil', component: AccueilComponent },
  { path: 'connexion', component: ConnexionComponent },
  // { path: 'inscription', component: InscriptionComponent },
  { path: 'ajout-product', component: EditStagiaireComponent },
  { path: '', redirectTo: 'accueil', pathMatch: 'full' },
  { path: '**', component: Page404Component },
  { path: 'dossiers', component: DossiersListComponent },
  { path: 'dossier/:id', component: DossierDetailComponent },
  { path: 'dossier-form/:id', component: DossierFormComponent },
  { path: '', redirectTo: '/dossiers', pathMatch: 'full' },
];
