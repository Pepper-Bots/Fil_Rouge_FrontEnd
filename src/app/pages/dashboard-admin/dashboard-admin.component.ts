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
import {MatChip, MatChipSet} from '@angular/material/chips';
import {MatList, MatListItem} from '@angular/material/list';
import {MatTooltip} from '@angular/material/tooltip';

import {
  DashboardService,
  DocumentValidationRequest,
  InscriptionAttente,
  DocumentAttente,
  KpiData
} from '../../services/crud/dashboard-admin.service';


@Component({
  selector: 'app-dashboard-admin',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChip,
    MatChipSet,
    MatListItem,
    MatList,
    MatTooltip
  ],
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
  InscriptionsAttente: InscriptionAttente[] = [];
  DocumentsAttente: DocumentAttente[] = [];

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
  ) {
  }

  // ===== LIFECYCLE HOOKS =====

  ngOnInit(): void {
    this.initialiserDashboard();
    this.demarrerRafraishissementAutomatique();
  }

  ngOnDestroy(): void {
    // Cleanup subscriptions
    this.subscriptions.forEach(sub => sub?.unsubscribe());
    if (this.refreshInterval) {
      this.refreshInterval.unsubscribe();
    }
  }

  // ===== MÉTHODES PRIVÉES D'INITIALISATION =====

  /**
   * Charge toutes les données initiales du dashboard
   */
  private initialiserDashboard(): void {
    this.recupererStats();
    this.chargerDemandesEnAttente();
    this.recupererDocumentsAVerifier();
  }

  /**
   * Charge les KPIs depuis l'API
   */
  private recupererStats(): void {
    this.isLoadingKpis = true;

    const statsSubscription = this.dashboardService.getKpis()
      .subscribe({
        next: (data: KpiData) => {
          this.kpiData = data;
          this.isLoadingKpis = false;
        },
        error: (error: any) => {
          console.error('Erreur lors du chargement des statistiques:', error);
          // Données de démonstration si l'API échoue
          this.kpiData = {
            nbStagiaires: 0,
            nbFormations: 0,
            nbIntervenants: 0,
            nbDocsAttente: 0,
            nbDocsValidation: 0,
            nbInscriptionsAttente: 0
          };
          this.isLoadingKpis = false;
          this.gererErreur('Chargement des données en cours...');
        }
      });
    this.subscriptions.push(statsSubscription);
  }

  /**
   * Charge la liste des inscriptions en attente
   */
  private chargerDemandesEnAttente(): void {
    this.isLoadingInscriptions = true;

    const demandesSubscription = this.dashboardService.getInscriptionsAttente()
      .subscribe({
        next: (data: InscriptionAttente[]) => {
          this.InscriptionsAttente = data.sort((a, b) =>
            new Date(a.dateInscription).getTime() - new Date(b.dateInscription).getTime()
          );
          this.isLoadingInscriptions = false;
        },
        error: (error: any) => {
          console.error('Erreur lors du chargement des inscriptions en attente:', error);
          this.gererErreur('Impossible de charger les inscriptions en attente:');
          this.isLoadingInscriptions = false;
        }
      });
    this.subscriptions.push(demandesSubscription);
  }

  /**
   * Charge la liste des documents en attente de validation
   */
  private recupererDocumentsAVerifier(): void {
    this.isLoadingDocuments = true;

    const docsSubscription = this.dashboardService.getDocumentsAttente()
      .subscribe({
        next: (data: DocumentAttente[]) => {
          this.DocumentsAttente = data.sort((a, b) =>
            new Date(a.dateDepot).getTime() - new Date(b.dateDepot).getTime()
          );
          this.isLoadingDocuments = false;
        },
        error: (error: any) => {
          console.error('Erreur lors du chargement des documents:', error);
          this.gererErreur('Impossible de charger les documents en attente');
          this.isLoadingDocuments = false;
        }
      });

    this.subscriptions.push(docsSubscription);
  }

  // ===== MÉTHODES PUBLIQUES - ACTIONS PRINCIPALES - ATTENDUES PAR LE HTML =====

  /**
   * Rafraîchit manuellement les données - ATTENDU PAR LE HTML
   */
  rafraichir(): void {
    const refreshSubscription = this.dashboardService.rafraichirToutesDonnees()
      .subscribe({
        next: () => {
          this.snackBar.open('Données mises à jour', 'OK', {
            duration: 2000
          });
        },
        error: (error: any) => {
          this.gererErreur('Erreur lors de l\'actualisation');
        }
      });

    this.subscriptions.push(refreshSubscription);
  }

  /**
   * Actualise les données en interne
   */
  actualiserDonnees(): void {
    this.recupererStats();
    this.chargerDemandesEnAttente();
    this.recupererDocumentsAVerifier();
  }

  // ===== MÉTHODES DE NAVIGATION =====

  /**
   * Navigue vers le détail d'une inscription - ATTENDU PAR LE HTML
   */
  voirDetailInscription(inscription: InscriptionAttente): void {
    this.router.navigate(['/admin/traitement-inscription', inscription.id]);
  }

  /**
   * Navigation vers toutes les inscriptions - ATTENDU PAR LE HTML
   */
  voirToutesLesInscriptions(): void {
    this.router.navigate(['/admin/gestion-inscriptions']);
  }

  /**
   * Navigation vers tous les documents - ATTENDU PAR LE HTML
   */
  voirTousLesDocuments(): void {
    this.router.navigate(['/admin/gestion-documents']);
  }

  /**
   * Navigue vers la validation d'un document - ATTENDU PAR LE HTML
   */
  voirDocument(document: DocumentAttente): void {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/admin/document', document.id, 'validation'])
    );
    window.open(url, '_blank');
  }

  // ===== MÉTHODES DE GESTION DES DOCUMENTS =====

  /**
   * Télécharge un document - ATTENDU PAR LE HTML
   */
  telechargerDocument(document: DocumentAttente): void {
    const downloadSubscription = this.dashboardService.telechargerDocument(document.id)
      .subscribe({
        next: (fichier: Blob) => {
          this.sauvegarderFichier(fichier, document.nomFichierOriginal || document.nomFichier);
        },
        error: (error: any) => {
          this.gererErreur('Impossible de télécharger le document');
        }
      });

    this.subscriptions.push(downloadSubscription);
  }


  /**
   * Valide rapidement un document - ATTENDU PAR LE HTML
   */
  validerDocumentRapide(document: DocumentAttente): void {
    if (confirm('Valider ce document ?')) {
      const validationRequest: DocumentValidationRequest = {
        documentId: document.id,
        statut: 'VALIDE',
        commentaires: 'Validation rapide depuis le dashboard'
      };

      const validationSubscription = this.dashboardService.validerDocument(validationRequest)
        .subscribe({
          next: () => {
            this.snackBar.open('Document approuvé', 'OK', {
              duration: 2000,
              panelClass: ['snackbar-success']
            });
            this.actualiserDonnees();
          },
          error: (error: any) => {
            this.gererErreur('Impossible de valider le document');
          }
        });

      this.subscriptions.push(validationSubscription);
    }
  }

  /**
   * Rejette un document - ATTENDU PAR LE HTML (HTML utilise rejeterDocument)
   */
  rejeterDocument(document: DocumentAttente): void {
    const motif = prompt('Motif de rejet (optionnel):');

    if (motif !== null) {
      const rejetSubscription = this.dashboardService.rejeterDocument(
        document.id,
        motif || 'Document non conforme'
      ).subscribe({
        next: () => {
          this.snackBar.open('Document rejeté', 'OK', {
            duration: 2000,
            panelClass: ['snackbar-warning']
          });
          this.actualiserDonnees();
        },
        error: (error: any) => {
          this.gererErreur('Impossible de rejeter le document');
        }
      });

      this.subscriptions.push(rejetSubscription);
    }
  }

  /**
   * Valide tous les documents d'un type donné
   */
  validerTousLesDiplomes(): void {
    const diplomes = this.DocumentsAttente.filter(d =>  // ← CORRECTION
      d.typeDocument === 'DIPLOME' && d.statut === 'EN_ATTENTE'
    );

    if (diplomes.length === 0) {
      this.snackBar.open('Aucun diplôme à valider', 'OK');
      return;
    }

    if (confirm(`Valider les ${diplomes.length} diplômes en attente ?`)) {
      this.traiterEnLot(diplomes, 'VALIDE');
    }
  }

  // ===== MÉTHODES UTILITAIRES D'AFFICHAGE =====

  /**
   * Retourne la couleur du badge selon le statut - ATTENDU PAR LE HTML
   */
  getBadgeColor(statut: string): string {
    const couleurs = {
      'COMPLET': 'primary',
      'VALIDE': 'primary',
      'INCOMPLET': 'warn',
      'EN_COURS': 'accent',
      'REJETE': 'warn'
    };
    return couleurs[statut as keyof typeof couleurs] || 'basic';
  }

  /**
   * Retourne l'icône du fichier - ATTENDU PAR LE HTML
   */
  getFileIcon(typeFichier: string): string {
    const type = typeFichier.toLowerCase();
    if (type.includes('pdf')) return 'picture_as_pdf';
    if (type.includes('image') || type.includes('jpg') || type.includes('png')) return 'image';
    if (type.includes('word') || type.includes('doc')) return 'description';
    if (type.includes('excel') || type.includes('xls')) return 'table_chart';
    return 'insert_drive_file';
  }

  /**
   * Formate la taille d'un fichier - ATTENDU PAR LE HTML
   */
  formatTailleFichier(octets: number): string {
    if (octets < 1000) return `${octets} o`;
    if (octets < 1000000) return `${Math.round(octets / 1000)} Ko`;
    return `${Math.round(octets / 1000000)} Mo`;
  }

  formaterDateDepot(date: Date): string {
    const joursEcoules = this.calculerJoursDepuis(date);
    if (joursEcoules === 0) return 'Aujourd\'hui';
    if (joursEcoules === 1) return 'Hier';
    if (joursEcoules < 7) return `Il y a ${joursEcoules} jours`;
    return new Date(date).toLocaleDateString('fr-FR');
  }

  estUrgent(demande: InscriptionAttente): boolean {
    const joursEcoules = this.calculerJoursDepuis(demande.dateInscription);
    return joursEcoules > 5 || demande.documentsManquants.length > 2;
  }

  // ===== MÉTHODES UTILITAIRES =====

  private calculerJoursDepuis(date: Date): number {
    const maintenant = new Date().getTime();
    const datePassee = new Date(date).getTime();
    return Math.floor((maintenant - datePassee) / (1000 * 3600 * 24));
  }

  /**
   * Sauvegarde un fichier téléchargé
   */
  // todo vérifier le type de sauvegarde
  private sauvegarderFichier(blob: Blob, nomFichier: string): void {
    const url = URL.createObjectURL(blob);
    const lien = document.createElement('a');
    lien.href = url;
    lien.download = nomFichier;
    lien.click();
    URL.revokeObjectURL(url);
  }

  private gererErreur(message: string): void {
    console.error(message);
    this.errorMessage = '';
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['snackbar-info']
    });
  }

  private traiterEnLot(documents: DocumentAttente[], action: string): void {
    let traites = 0;
    documents.forEach(doc => {
      this.dashboardService.validerDocument({
        documentId: doc.id,
        statut: action as any,
        commentaires: 'Traitement en lot'
      }).subscribe({
        next: () => {
          traites++;
          if (traites === documents.length) {
            this.snackBar.open(`${traites} documents traités`, 'OK');
            this.actualiserDonnees();
          }
        },
        error: (error: any) => {
          this.gererErreur('Erreur lors du traitement en lot');
        }
      });
    });
  }

  // ===== MÉTHODES DE CONFIGURATION =====

  configurerAffichage(): void {
    this.router.navigate(['/admin/parametres/dashboard']);
  }

  private demarrerRafraishissementAutomatique() {

  }

  naviguerVersValidationDocuments(): void {
    this.router.navigate(['/document-validation']);
  }

}
