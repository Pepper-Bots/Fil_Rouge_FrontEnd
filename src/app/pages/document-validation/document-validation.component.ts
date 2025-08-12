import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {DocumentService} from '../../services/crud/document.service';
import {Document} from '../../models/document';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatChipsModule} from '@angular/material/chips';
import {MatListModule} from '@angular/material/list';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

interface DocumentValidation {
  Statut: string;
  Commentaire?: string;
}

@Component({
  selector: 'app-document-validation',
  imports: [CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule
    ],
  templateUrl: './document-validation.component.html',
  styleUrl: './document-validation.component.scss'
})
export class DocumentValidationComponent implements OnInit {
  documents: Document[] = [];
  selectedDocument: Document | null = null;
  validationForm: FormGroup;
  isLoading = false;
  isValidating = false;

  constructor(
    private documentService: DocumentService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.validationForm = this.fb.group({
      commentaire: ['']
    });
  }

  ngOnInit(): void {
    this.loadDocumentsEnAttente();
    this.checkNotifications();
  }

  loadDocumentsEnAttente(): void {
    this.isLoading = true;
    this.documentService.getDocumentsEnAttente()
    .subscribe({
      next: (documents) => {
        this.documents = documents;
        console.log('Documents chargés:', documents); // ✅ Debug
      },
      error: (error) => {
        console.error('Erreur de chargement des documents', error);
        this.snackBar.open('Erreur lors du chargement des documents', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  selectDocument(document: Document): void {
    this.selectedDocument = document;
    this.validationForm.reset();
  }

  validateDocument(statut: 'VALIDÉ' | 'REFUSÉ'): void {
    if (!this.selectedDocument) return;

    const validation: DocumentValidation = {
      Statut: statut,
      Commentaire: this.validationForm.value.commentaire || ''
    };

    // On stocke la référence avant de la perdre
    const documentToNotify = this.selectedDocument;

    this.isValidating = true;
    this.documentService.validerDocument(this.selectedDocument.id, validation)
    .subscribe({
      next: () => {
        // Supprimer le document de la liste
        this.documents = this.documents.filter(d => d.id !== this.selectedDocument?.id);

        this.snackBar.open(`Document ${statut.toLowerCase()} avec succès !`, 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        // On notifie le stagiaire en utilisant la référence stockée
        this.notifyStagiaire(documentToNotify, statut);


        this.selectedDocument = null;
        this.validationForm.reset();
      },
      error: (error) => {
        console.error('Erreur validation:', error);
        this.snackBar.open('Erreur lors de la validation', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      },
      complete: () => {
        this.isValidating = false;
      }
    });
  }

  downloadDocument(doc: Document): void {
    this.documentService.downloadDocument(doc.id)
    .subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.nomFichier;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur téléchargement:', error);
        this.snackBar.open('Erreur lors du téléchargement', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getTypeDisplayName(type: any): string {
    return this.documentService.getTypeDisplayName(type);
  }

  formatDate(date: string): string { // todo type date ? voir avec back
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Système de notification simple
  private checkNotifications(): void {
    const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    const unreadCount = notifications.filter((n: any) => !n.read).length;

    if (unreadCount > 0) {
      this.snackBar.open(`${unreadCount} nouveau(x) document(s) à valider`, 'Voir', {
        duration: 5000,
        panelClass: ['info-snackbar']
      });

      // Marquer comme lu
      notifications.forEach((n: any) => n.read = true);
      localStorage.setItem('admin_notifications', JSON.stringify(notifications));
    }
  }

  private notifyStagiaire(doc: Document, statut: string): void {
    // Simulation de notification au stagiaire
    const stagiaireNotifications = JSON.parse(localStorage.getItem(`stagiaire_notifications_${doc.stagiaire.id}`) || '[]');
    stagiaireNotifications.push({
      id: Date.now(),
      message: `Votre document "${this.getTypeDisplayName(doc.type)}" a été ${statut.toLowerCase()}`,
      type: 'document_validation',
      timestamp: new Date().toISOString(),
      read: false,
      statut: statut
    });
    localStorage.setItem(`stagiaire_notifications_${doc.stagiaire.id}`, JSON.stringify(stagiaireNotifications));
  }
}
