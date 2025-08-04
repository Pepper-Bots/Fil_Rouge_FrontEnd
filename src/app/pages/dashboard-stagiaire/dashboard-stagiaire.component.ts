import { Component, ViewEncapsulation} from '@angular/core';
import {EvenementDeclarationComponent} from './evenement-declaration/evenement-declaration.component';
import {CommonModule} from '@angular/common';


@Component({
  selector: 'app-dashboard-stagiaire',
  imports: [
    EvenementDeclarationComponent,
    CommonModule,
  ],
  encapsulation: ViewEncapsulation.Emulated,  // optionnel, par défaut c’est ça
  templateUrl: './dashboard-stagiaire.component.html',
  styleUrls: ['./dashboard-stagiaire.component.scss']
})
export class DashboardStagiaireComponent {
  isPanelOpen = false;

  togglePanel() {
    // Gestion de l'affichage des panneaux latéraux
    this.isPanelOpen = !this.isPanelOpen;
  }


}
