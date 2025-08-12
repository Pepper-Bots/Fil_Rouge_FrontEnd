import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {Router, RouterModule} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {interval, Subscription} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {HttpClient} from '@angular/common/http';
import {MatChip} from '@angular/material/chips';
import {MatList, MatListItem} from '@angular/material/list';
import {
  DashboardService,
  DocumentValidationRequest,
  InscriptionAttente
} from '../../services/crud/dashboard-admin.service';
import {DocumentValidationComponent} from '../document-validation/document-validation.component';

interface KpiData {
  nbStagiaires: number;
  nbFormations: number;
  nbIntervenants: number;
  nbDocsAttente: number;
  nbDocsValidation: number;
  nbInscriptionsAttente: number;
}

interface KpiInscriptionAttente {
  id: number;
  nomStagiaire: string;
  prenomStagiaire: string;
  nomFormation: string;
  statutDossier: string;
  dateInscription: Date;
  documentsManquants: string[];
}

interface DocumentAttente {
  id: number;
  nomFichier: string;
  typeFichier: string;
  nomStagiaire: string;
  prenomStagiaire: string;
  dateDepot: Date;
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'VALIDE' | 'REJETE';
  taille: number;
}

@Component({
  selector: 'app-dashboard-admin',
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatProgressSpinnerModule, MatChip, MatListItem, MatList],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.scss'
})
export class DashboardAdminComponent implements OnInit, OnDestroy {

  // KPIs Data
  kpiData: KpiData = {
    nbStagiaires: 0,
    nbFormations: 0,
    nbIntervenants: 0,
    nbDocsAttente: 0,
    nbDocsValidation: 0,
    nbInscriptionsAttente: 0,
  };

  // Lists Data
  inscriptionsAttente: InscriptionAttente[] = [];
  documentsAttente: DocumentAttente[] = [];

  // Loading states
  isLoadingKpis = true;
  isLoadingInscriptions = true;
  isLoadingDocuments = true;

  // Error handling
  errorMessage = '';

  // Subscriptions for cleanup
  private subscriptions: Subscription[] = [];
  private refreshInterval: Subscription | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private dashboardService: DashboardService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.chargerDonneesInitiales();
    this.demarrerRafraishissementAutomatique();
  }

  ngOnDestroy(): void {
    // Cleanup subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.refreshInterval) {
      this.refreshInterval.unsubscribe();
    }
  }

  /**
   * Charge toutes les données initiales du dashboard
   */
  private chargerDonneesInitiales(): void {
    this.chargerKpis();
    this.chargerInscriptionsAttente();
    this.chargerDocumentsAttente();
  }

  /**
   * Charge les KPIs depuis l'API
   */
  private chargerKpis(): void {
    this.isLoadingKpis = true;

    const kpisSubscription = this.dashboardService.getKpis()
    .subscribe({
      next: (data) => {
        this.kpiData = data;
        this.isLoadingKpis = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des KPIs:', error);
        this.gererErreur('Impossible de charger les indicateurs');
        this.isLoadingKpis = false;
      }
    });
    this.subscriptions.push(kpisSubscription);
  }

  /**
   * Charge la liste des inscriptions en attente
   */
  private chargerInscriptionsAttente(): void {
    this.isLoadingInscriptions = true;

    const inscriptionsSubscription = this.dashboardService.getInscriptionsAttente()
    .subscribe({
      next: (data) => {
        this.inscriptionsAttente = data;
        this.isLoadingInscriptions = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des inscriptions en attente:', error);
        this.gererErreur('Impossible de charger les inscriptions en attente:');
        this.isLoadingInscriptions = false;
      }
    });
    this.subscriptions.push(inscriptionsSubscription);
  }

  /**
   * Charge la liste des documents en attente de validation
   */
  private chargerDocumentsAttente(): void {
    this.isLoadingDocuments = true;

    const documentsSubscription = this.dashboardService.getDocumentsAttente()
      .subscribe({
        next: (data) => {
          this.documentsAttente = data;
          this.isLoadingDocuments = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des documents:', error);
          this.gererErreur('Impossible de charger les documents en attente');
          this.isLoadingDocuments = false;
        }
      });

    this.subscriptions.push(documentsSubscription);
  }

  /**
   * Navigue vers le détail d'une inscription
   */
  voirDetailInscription(inscription: InscriptionAttente): void {
    this.router.navigate(['/admin/inscriptions', inscription.id]);
  }

  /**
   * Navigue vers la validation d'un document
   */
  voirDocument(document: DocumentAttente): void {
    this.router.navigate(['/admin/documents', document.id, 'validation']);
  }

  /**
   * Télécharge un document
   */
  telechargerDocument(document: DocumentAttente): void {
    const downloadSubscription = this.dashboardService.telechargerDocument(document.id)
    .subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = document.nomFichierOriginal || document.nomFichier;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (error) => {
        this.gererErreur('Impossible de télécharger le document');
      }
    });

    this.subscriptions.push(downloadSubscription);
  }

  /**
   * Valide rapidement un document depuis le dashboard
   */
  validerDocumentRapide(document: DocumentAttente): void {
    const validationRequest: DocumentValidationRequest = {
      documentId: document.id,
      statut: 'VALIDE',
      commentaires: 'Validation rapide depuis le dashboard'
    };

    const validationSubscription = this.dashboardService.validerDocument(validationRequest)
      .subscribe({
        next: () => {
          this.snackBar.open('Document validé avec succès', 'Fermer', {
            duration: 3000,
            panelClass: ['snackbar-success']
          });
          this.chargerDocumentsAttente();
          this.chargerKpis();
        },
        error: (error) => {
          this.gererErreur('Impossible de valider le document');
        }
      });

    this.subscriptions.push(validationSubscription);
  }

  /**
   * Rejette un document avec un motif
   */
  rejeterDocument(document: DocumentAttente): void {
    // Ici, vous pourriez ouvrir une dialog pour saisir le motif de rejet
    const motif = prompt('Motif de rejet (optionnel):');

    if (motif !== null) { // L'utilisateur n'a pas annulé
      const rejetSubscription = this.dashboardService.rejeterDocument(
        document.id,
        motif || 'Document non conforme'
      ).subscribe({
        next: () => {
          this.snackBar.open('Document rejeté', 'Fermer', {
            duration: 3000,
            panelClass: ['snackbar-warning']
          });
          this.chargerDocumentsAttente();
          this.chargerKpis();
        },
        error: (error) => {
          this.gererErreur('Impossible de rejeter le document');
        }
      });

      this.subscriptions.push(rejetSubscription);
    }
  }

  /**
   * Gère l'affichage des erreurs
   */
  private gererErreur(message: string): void {
    this.errorMessage = message;
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['snackbar-error']
    });
  }

  /**
   * Rafraîchit manuellement les données
   */
  rafraichir(): void {
    this.dashboardService.rafraichirToutesDonnees().subscribe({
      next: () => {
        this.snackBar.open('Données mises à jour', 'Fermer', {
          duration: 2000
        });
      },
      error: (error) => {
        this.gererErreur('Erreur lors de l\'actualisation');
      }
    });
  }

  /**
   * Démarre le rafraichissement auto toutes les 30 sec
   */
  private demarrerRafraishissementAutomatique(): void {
    this.refreshInterval = interval(30000).subscribe(() => {
      this.chargerKpis();
      this.chargerInscriptionsAttente();
      this.chargerDocumentsAttente();
    });
  }

  /**
   * Retourne le badge color selon le statut du dossier
   */
  getBadgeColor(statut: string): string {
    switch (statut) {
      case 'COMPLET': return 'primary';
      case 'INCOMPLET': return 'warn';
      case 'EN_COURS': return 'accent';
      default: return 'basic';
    }
  }

  /**
   * Retourne l'icône selon le type de fichier
   */
  getFileIcon(typeFichier: string): string {
    const type = typeFichier.toLowerCase();
    if (type.includes('pdf')) return 'picture_as_pdf';
    if (type.includes('image')) return 'image';
    if (type.includes('word') || type.includes('doc')) return 'description';
    return 'insert_drive_file';
  }

  /**
   * Formate la taille d'un fichier
   */
  formatTailleFichier(taille: number): string {
    if (taille < 1024) return `${taille} B`;
    if (taille < 1024 * 1024) return `${(taille / 1024).toFixed(1)} KB`;
    return `${(taille / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Navigue vers la gestion complète des documents
   */
  voirTousLesDocuments(): void {
    this.router.navigate(['/admin/documents']);
  }

  /**
   * Navigue vers la gestion complète des inscriptions
   */
  voirToutesLesInscriptions(): void {
    this.router.navigate(['/admin/inscriptions']);
  }
}
