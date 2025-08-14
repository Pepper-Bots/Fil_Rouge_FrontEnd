import { Component, ViewEncapsulation} from '@angular/core';
import {EvenementDeclarationComponent} from './evenement-declaration/evenement-declaration.component';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard, MatCardContent} from '@angular/material/card';


@Component({
  selector: 'app-dashboard-stagiaire',
  imports: [
    EvenementDeclarationComponent,
    CommonModule,
    MatIcon,
    MatButton,
    MatCardContent,
    MatCard,
    MatIconButton,
  ],
  encapsulation: ViewEncapsulation.Emulated,  // optionnel, par défaut c’est ça
  templateUrl: './dashboard-stagiaire.component.html',
  styleUrls: ['./dashboard-stagiaire.component.scss']
})
export class DashboardStagiaireComponent {
  isPanelOpen = false;

  constructor(private router: Router) {}

  togglePanel() {
    // Gestion de l'affichage des panneaux latéraux
    this.isPanelOpen = !this.isPanelOpen;
  }

  /**
   * Navigation vers l'upload de documents
   */
  navigateToDocumentUpload(): void {
    this.router.navigate(['/document-upload']);
  }

  /**
   * Navigation vers la liste des documents
   */
  navigateToMyDocuments(): void {
    // TODO: créer cette route si nécessaire
    this.router.navigate(['/mes-documents']);
  }

  /**
   * Navigation vers le profil
   */
  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
