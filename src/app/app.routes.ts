import { Routes } from '@angular/router';
// import {AccueilComponent} from './pages/accueil/accueil.component';
import { ConnexionComponent } from './pages/connexion/connexion.component';
// import {Page404Component} from './pages/page404/page404.component';
// import {EditProductComponent} from './pages/edit-product/edit-product.component';

export const routes: Routes = [
  { path: 'connexion', component: ConnexionComponent },
  // { path: 'inscription', component: InscriptionComponent },
  { path: '', redirectTo: '/connexion', pathMatch: 'full' },
  // autres routes...
];
