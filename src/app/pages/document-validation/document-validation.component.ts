import {Component, OnInit, OnDestroy} from '@angular/core';
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
import {Subscription} from 'rxjs';

interface DocumentValidation {
  Statut: string;
  Commentaire?: string;
}

interface ValidationStats {
  validatedToday: number;
  rejectedToday: number;
  totalProcessed: number;
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
export class DocumentValidationComponent implements OnInit, OnDestroy {
  // Data properties
  documents: Document[] = [];
  selectedDocument: Document | null = null;
  validationForm: FormGroup;

  // Loading states
  isLoading = false;
  isValidating = false;

  // Stats
  validatedToday= 0;
  rejectedToday = 0;

  // Error handling
  errorMessage = '';

  // Subscription for cleanup
  private subscriptions: Subscription[] = [];

  constructor(
    private documentService: DocumentService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.validationForm = this.fb.group({
      commentaire: ['']
    });
  }

  // ===== LIFECYCLE HOOKS =====

  ngOnInit(): void {
    this.initialiserValidation();
    this.chargerStatistiques();
  }

  ngOnDestroy(): void {
    // Cleanup subscriptions
    this.subscriptions.forEach(sub => sub?.unsubscribe());
  }

  // ===== MÉTHODES PRIVÉES D'INITIALISATION =====

  /**
   * Initialise le composant de validation
   */
  private initialiserValidation(): void {
    this.loadDocumentsEnAttente();
    this.checkNotifications();
  }

  /**
   * Charge les statistiques du jour
   */
  private chargerStatistiques(): void {
    // Simuler des statistiques - à remplacer par un appel API réel
    const stats = this.getValidationStatsFromStorage();
    this.validatedToday = stats.validatedToday;
    this.rejectedToday = stats.rejectedToday;
  }

  // ===== MÉTHODES PUBLIQUES - GESTION DES DOCUMENTS =====

  /**
   * Charge la liste des documents en attente
   */
  loadDocumentsEnAttente(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const documentsSubscription = this.documentService.getDocumentsEnAttente()
      .subscribe({
        next: (documents) => {
          this.documents = documents.sort((a, b) =>  {
          // Tri sécurisé avec gestion des dates manquantes
          if (!a.dateDepot && !b.dateDepot) return 0;
          if (!a.dateDepot) return 1; // a va à la fin
          if (!b.dateDepot) return -1; // b va à la fin

          return new Date(a.dateDepot).getTime() - new Date(b.dateDepot).getTime();
        });
          console.log('Documents chargés:', documents);
        },
        error: (error) => {
          console.error('Erreur de chargement des documents', error);
          this.gererErreur('Erreur lors du chargement des documents');
        },
        complete: () => {
          this.isLoading = false;
        }
      });

    this.subscriptions.push(documentsSubscription);
  }

  /**
   * Sélectionne un document pour validation
   */
  selectDocument(document: Document): void {
    this.selectedDocument = document;
    this.validationForm.reset();
  }

  /**
   *
   * @param statut
   */
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

  /**
   * Prévisualise un document
   * @param type
   */
  previewDocument(doc: Document): void {
    // Pour les PDFs et les img, on peut ouvrir une prévisu
    if (this.isPreviewSupported(doc)) {
      this.downloadDocument(doc); // pour l'instatn on télécharge
      // todo - implémenter une vraie prévisu dans un dialog
    } else {
      this.snackBar.open('Impossible de prévisualiser ce type de fichier', 'OK', {
        duration: 3000,
        panelClass: ['snackbar-info']
      });
    }
  }

  // ===== MÉTHODES UTILITAIRES D'AFFICHAGE =====

  /**
   * Retourne l'icône correspondant au type de fichier
   */
  getFileIcon(type: any): string {
    const typeStr = type?.toString().toLowerCase() || '';

    if (typeStr.includes('pdf')) return 'picture_as_pdf';
    if (typeStr.includes('image') || typeStr.includes('jpg') || typeStr.includes('png')) return 'image';
    if (typeStr.includes('word') || typeStr.includes('doc')) return 'description';
    if (typeStr.includes('excel') || typeStr.includes('xls')) return 'table_chart';
    return 'insert_drive_file';
  }

  /**
   * Retourne le nom d'affichage du type de document
   */
  getTypeDisplayName(type: any): string {
    return this.documentService.getTypeDisplayName(type);
  }

  /**
   * Formate la date pour l'affichage
   */
  formatDate(date?: string): string {
    if (!date) return 'Non renseigné';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Formate la taille du fichier
   */
  formatFileSize(bytes?: number): string {
    if (!bytes || bytes < 1000) return `${bytes || 0} o`;
    if (bytes < 1000) return `${bytes} o`;
    if (bytes < 1000000) return `${Math.round(bytes / 1000)} Ko`;
    return `${Math.round(bytes / 1000000)} Mo`;
  }

  /**
   * Retourne la couleur de priorité pour un document
   */
  getPriorityColor(doc: Document): string {
    if (!doc.dateDepot) return 'primary';

    const daysSinceUpload = this.calculateDaysSince(doc.dateDepot);

    if (daysSinceUpload > 7) return 'warn';
    if (daysSinceUpload > 3) return 'accent';
    return 'primary';
  }

  // ===== MÉTHODES D'ACTIONS EN LOT =====

  /**
   * Valide tous les documents visibles
   */
  validateAllDocuments(): void {
    if (this.documents.length === 0) return;

    const confirmation = confirm(`Êtes-vous sûr de vouloir valider les ${this.documents.length} documents affichés ?`);

    if (confirmation) {
      const documentsToValidate = [...this.documents];
      let processed = 0;
      let errors = 0;

      documentsToValidate.forEach(doc => {
        const validation: DocumentValidation = {
          Statut: 'VALIDÉ',
          Commentaire: 'Validation en lot par l\'administrateur'
        };

        const validationSub = this.documentService.validerDocument(doc.id, validation)
          .subscribe({
            next: () => {
              processed++;
              this.updateValidationStats('VALIDÉ');
              this.notifyStagiaire(doc, 'VALIDÉ');

              if (processed + errors === documentsToValidate.length) {
                this.finalizeBatchValidation(processed, errors);
              }
            },
            error: () => {
              errors++;
              if (processed + errors === documentsToValidate.length) {
                this.finalizeBatchValidation(processed, errors);
              }
            }
          });

        this.subscriptions.push(validationSub);
      });
    }
  }

  /**
   * Exporte la liste des documents au format CSV
   */
  exportDocumentsList(): void {
    if (this.documents.length === 0) {
      this.snackBar.open('Aucun document à exporter', 'OK', {
        duration: 3000,
        panelClass: ['snackbar-info']
      });
      return;
    }

    const csvContent = this.generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `documents_en_attente_${new Date().toISOString().split('T')[0]}.csv`;

    this.sauvegarderFichier(blob, fileName);

    this.snackBar.open('Liste exportée avec succès', 'OK', {
      duration: 3000,
      panelClass: ['snackbar-success']
    });
  }

  // ===== MÉTHODES PRIVÉES UTILITAIRES =====

  /**
   * Calcule le nombre de jours depuis une date
   */
  private calculateDaysSince(date: string): number {
    if (!date) return 0;
    const now = new Date().getTime();
    const pastDate = new Date(date).getTime();
    return Math.floor((now - pastDate) / (1000 * 3600 * 24));
  }

  /**
   * Vérifie si la prévisualisation est supportée
   */
  private isPreviewSupported(doc: Document): boolean {
    const supportedTypes = ['pdf', 'image', 'jpg', 'jpeg', 'png'];
    const fileType = doc.nomFichier.split('.').pop()?.toLowerCase() || '';
    return supportedTypes.includes(fileType);
  }

  /**
   * Sauvegarde un fichier
   */
  private sauvegarderFichier(blob: Blob, nomFichier: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomFichier;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Gère les erreurs avec affichage
   */
  private gererErreur(message: string): void {
    console.error(message);
    this.errorMessage = message;
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['snackbar-error']
    });
  }

  /**
   * Met à jour les statistiques de validation
   */
  private updateValidationStats(statut: 'VALIDÉ' | 'REFUSÉ'): void {
    if (statut === 'VALIDÉ') {
      this.validatedToday++;
    } else {
      this.rejectedToday++;
    }
    this.saveValidationStatsToStorage();
  }

  /**
   * Finalise la validation en lot
   */
  private finalizeBatchValidation(processed: number, errors: number): void {
    this.documents = [];
    this.selectedDocument = null;

    let message = `${processed} document(s) validé(s)`;
    if (errors > 0) {
      message += `, ${errors} erreur(s)`;
    }

    this.snackBar.open(message, 'OK', {
      duration: 4000,
      panelClass: errors > 0 ? ['snackbar-warning'] : ['snackbar-success']
    });
  }

  /**
   * Génère le contenu CSV pour l'export
   */
  private generateCSVContent(): string {
    const headers = 'Nom du fichier,Type,Stagiaire,Date de dépôt,Taille,Priorité\n';
    const rows = this.documents.map(doc => {
      const stagiaire = `${doc.stagiaire.firstName} ${doc.stagiaire.lastName}`;
      const priority = this.getPriorityLabel(doc);
      return `"${doc.nomFichier}","${this.getTypeDisplayName(doc.type)}","${stagiaire}","${this.formatDate(doc.dateDepot)}","${this.formatFileSize(doc.taille)}","${priority}"`;
    }).join('\n');

    return headers + rows;
  }

  // ===== MÉTHODES DE GESTION DES NOTIFICATIONS =====

  /**
   * Vérifie les notifications non lues
   */
  private checkNotifications(): void {
    const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    const unreadCount = notifications.filter((n: any) => !n.read).length;

    if (unreadCount > 0) {
      this.snackBar.open(`${unreadCount} nouveau(x) document(s) à valider`, 'Voir', {
        duration: 5000,
        panelClass: ['snackbar-info']
      });

      // Marquer comme lu
      notifications.forEach((n: any) => n.read = true);
      localStorage.setItem('admin_notifications', JSON.stringify(notifications));
    }
  }

  /**
   * Notifie le stagiaire du résultat de validation
   */
  private notifyStagiaire(doc: Document, statut: string): void {
    const stagiaireNotifications = JSON.parse(
      localStorage.getItem(`stagiaire_notifications_${doc.stagiaire.id}`) || '[]'
    );

    stagiaireNotifications.push({
      id: Date.now(),
      message: `Votre document "${this.getTypeDisplayName(doc.type)}" a été ${statut.toLowerCase()}`,
      type: 'document_validation',
      timestamp: new Date().toISOString(),
      read: false,
      statut: statut
    });

    localStorage.setItem(
      `stagiaire_notifications_${doc.stagiaire.id}`,
      JSON.stringify(stagiaireNotifications)
    );
  }

  /**
   * Récupère les statistiques de validation depuis le localStorage
   */
  private getValidationStatsFromStorage(): ValidationStats {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`validation_stats_${today}`);

    if (stored) {
      return JSON.parse(stored);
    }

    return {
      validatedToday: 0,
      rejectedToday: 0,
      totalProcessed: 0
    };
  }

  /**
   * Sauvegarde les statistiques de validation
   */
  private saveValidationStatsToStorage(): void {
    const today = new Date().toDateString();
    const stats: ValidationStats = {
      validatedToday: this.validatedToday,
      rejectedToday: this.rejectedToday,
      totalProcessed: this.validatedToday + this.rejectedToday
    };

    localStorage.setItem(`validation_stats_${today}`, JSON.stringify(stats));
  }

  /**
   * Retourne le label de priorité pour un document
   */
  getPriorityLabel(doc: Document): string {
    if (!doc.dateDepot) return 'primary';

    const daysSinceUpload = this.calculateDaysSince(doc.dateDepot);

    if (daysSinceUpload > 7) return 'Urgent';
    if (daysSinceUpload > 3) return 'Important';
    return 'Normal';
  }
}
