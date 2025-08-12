import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Interfaces pour les données
export interface KpiData {
  nbStagiaires: number;
  nbFormations: number;
  nbIntervenants: number;
  nbDocsAttente: number;
  nbDocsValidation: number;
  nbInscriptionsAttente: number;
  evolutionStagiaires?: number;
  evolutionFormations?: number;
}

export interface InscriptionAttente {
  id: number;
  stagiaireId: number;
  stagiaireNom: string;
  stagiairePrenom: string;
  stagiaireEmail: string;
  formationId: number;
  formationNom: string;
  statutDossier: 'INCOMPLET' | 'COMPLET' | 'EN_COURS' | 'VALIDE';
  dateInscription: Date;
  documentsManquants: string[];
  documentsDeposes: number;
  documentsRequis: number;
  priorite: 'HAUTE' | 'NORMALE' | 'BASSE';
}

export interface DocumentAttente {
  id: number;
  nomFichier: string;
  nomFichierOriginal: string;
  typeFichier: string;
  typeDocument: 'CV' | 'PIECE_IDENTITE' | 'DIPLOME' | 'JUSTIFICATIF' | 'PHOTO' | 'AUTRE';
  stagiaireId: number;
  stagiaireNom: string;
  stagiairePrenom: string;
  stagiaireEmail: string;
  dateDepot: Date;
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'VALIDE' | 'REJETE';
  taille: number;
  cheminFichier: string;
  motifRejet?: string;
  validePar?: string;
  dateValidation?: Date;
}

export interface DocumentValidationRequest {
  documentId: number;
  statut: 'VALIDE' | 'REJETE';
  motif?: string;
  commentaires?: string;
}

export interface NotificationSetting {
  emailActif: boolean;
  pushActif: boolean;
  frequenceRappel: 'IMMEDIATE' | 'QUOTIDIEN' | 'HEBDOMADAIRE';
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly API_BASE_URL = environment.apiUrl || 'http://localhost:8080/api';

  // Subjects pour les données en temps réel
  private kpiDataSubject = new BehaviorSubject<KpiData | null>(null);
  private inscriptionsAttenteSubject = new BehaviorSubject<InscriptionAttente[]>([]);
  private documentsAttenteSubject = new BehaviorSubject<DocumentAttente[]>([]);

  // Observables publics
  public kpiData$ = this.kpiDataSubject.asObservable();
  public inscriptionsAttente$ = this.inscriptionsAttenteSubject.asObservable();
  public documentsAttente$ = this.documentsAttenteSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Headers HTTP avec authentification
   */
  private getHttpHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Gestion des erreurs HTTP
   */
  private handleError(operation = 'operation') {
    return (error: any): Observable<never> => {
      console.error(`${operation} failed:`, error);

      let errorMessage = 'Une erreur est survenue';

      if (error.status === 401) {
        errorMessage = 'Session expirée, veuillez vous reconnecter';
        // Optionnel: rediriger vers la page de connexion
        // this.router.navigate(['/login']);
      } else if (error.status === 403) {
        errorMessage = 'Accès non autorisé';
      } else if (error.status === 404) {
        errorMessage = 'Ressource non trouvée';
      } else if (error.status === 500) {
        errorMessage = 'Erreur serveur, veuillez réessayer plus tard';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }

      return throwError(() => new Error(errorMessage));
    };
  }

  // ==================== KPIs ====================

  /**
   * Récupère les indicateurs clés de performance
   */
  getKpis(): Observable<KpiData> {
    return this.http.get<KpiData>(`${this.API_BASE_URL}/admin/kpis`, {
      headers: this.getHttpHeaders()
    }).pipe(
      tap(data => this.kpiDataSubject.next(data)),
      catchError(this.handleError('getKpis'))
    );
  }

  /**
   * Récupère les KPIs avec historique pour les graphiques
   */
  getKpisWithHistory(periode: '7d' | '30d' | '3m' = '30d'): Observable<KpiData & { historique: any[] }> {
    return this.http.get<KpiData & { historique: any[] }>(`${this.API_BASE_URL}/admin/kpis/historique`, {
      headers: this.getHttpHeaders(),
      params: { periode }
    }).pipe(
      catchError(this.handleError('getKpisWithHistory'))
    );
  }

  // ==================== INSCRIPTIONS ====================

  /**
   * Récupère les inscriptions en attente
   */
  getInscriptionsAttente(limit: number = 10): Observable<InscriptionAttente[]> {
    return this.http.get<InscriptionAttente[]>(`${this.API_BASE_URL}/admin/inscriptions/attente`, {
      headers: this.getHttpHeaders(),
      params: { limit: limit.toString() }
    }).pipe(
      tap(data => this.inscriptionsAttenteSubject.next(data)),
      catchError(this.handleError('getInscriptionsAttente'))
    );
  }

  /**
   * Récupère le détail d'une inscription
   */
  getDetailInscription(inscriptionId: number): Observable<InscriptionAttente> {
    return this.http.get<InscriptionAttente>(`${this.API_BASE_URL}/admin/inscriptions/${inscriptionId}`, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError('getDetailInscription'))
    );
  }

  /**
   * Met à jour le statut d'une inscription
   */
  updateStatutInscription(inscriptionId: number, nouveauStatut: string): Observable<any> {
    return this.http.put(`${this.API_BASE_URL}/admin/inscriptions/${inscriptionId}/statut`, {
      statut: nouveauStatut
    }, {
      headers: this.getHttpHeaders()
    }).pipe(
      tap(() => {
        // Actualiser la liste après modification
        this.getInscriptionsAttente().subscribe();
      }),
      catchError(this.handleError('updateStatutInscription'))
    );
  }

  // ==================== DOCUMENTS ====================

  /**
   * Récupère les documents en attente de validation
   */
  getDocumentsAttente(limit: number = 15): Observable<DocumentAttente[]> {
    return this.http.get<DocumentAttente[]>(`${this.API_BASE_URL}/admin/documents/attente`, {
      headers: this.getHttpHeaders(),
      params: { limit: limit.toString() }
    }).pipe(
      tap(data => this.documentsAttenteSubject.next(data)),
      catchError(this.handleError('getDocumentsAttente'))
    );
  }

  /**
   * Télécharge un document
   */
  telechargerDocument(documentId: number): Observable<Blob> {
    return this.http.get(`${this.API_BASE_URL}/admin/documents/${documentId}/download`, {
      headers: this.getHttpHeaders(),
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError('telechargerDocument'))
    );
  }

  /**
   * Valide un document
   */
  validerDocument(validationRequest: DocumentValidationRequest): Observable<any> {
    return this.http.put(`${this.API_BASE_URL}/admin/documents/${validationRequest.documentId}/valider`,
      validationRequest, {
        headers: this.getHttpHeaders()
      }).pipe(
      tap(() => {
        // Actualiser les listes après validation
        this.getDocumentsAttente().subscribe();
        this.getKpis().subscribe();
      }),
      catchError(this.handleError('validerDocument'))
    );
  }

  /**
   * Rejette un document
   */
  rejeterDocument(documentId: number, motif: string, commentaires?: string): Observable<any> {
    return this.http.put(`${this.API_BASE_URL}/admin/documents/${documentId}/rejeter`, {
      motif,
      commentaires
    }, {
      headers: this.getHttpHeaders()
    }).pipe(
      tap(() => {
        // Actualiser les listes après rejet
        this.getDocumentsAttente().subscribe();
        this.getKpis().subscribe();
      }),
      catchError(this.handleError('rejeterDocument'))
    );
  }

  /**
   * Récupère les détails d'un document
   */
  getDetailDocument(documentId: number): Observable<DocumentAttente> {
    return this.http.get<DocumentAttente>(`${this.API_BASE_URL}/admin/documents/${documentId}`, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError('getDetailDocument'))
    );
  }

  // ==================== NOTIFICATIONS ====================

  /**
   * Envoie une notification à un stagiaire
   */
  envoyerNotificationStagiaire(stagiaireId: number, message: string, type: 'INFO' | 'WARNING' | 'SUCCESS'): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/admin/notifications/send`, {
      destinataireId: stagiaireId,
      message,
      type
    }, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError('envoyerNotificationStagiaire'))
    );
  }

  /**
   * Récupère les paramètres de notification
   */
  getParametresNotification(): Observable<NotificationSetting> {
    return this.http.get<NotificationSetting>(`${this.API_BASE_URL}/admin/notifications/settings`, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError('getParametresNotification'))
    );
  }

  // ==================== UTILITAIRES ====================

  /**
   * Actualise toutes les données du dashboard
   */
  rafraichirToutesDonnees(): Observable<any> {
    const requests = [
      this.getKpis(),
      this.getInscriptionsAttente(),
      this.getDocumentsAttente()
    ];

    return new Observable(observer => {
      let completedRequests = 0;
      const totalRequests = requests.length;

      requests.forEach(request => {
        request.subscribe({
          next: () => {
            completedRequests++;
            if (completedRequests === totalRequests) {
              observer.next(true);
              observer.complete();
            }
          },
          error: (error) => {
            observer.error(error);
          }
        });
      });
    });
  }

  /**
   * Recherche dans les documents
   */
  rechercherDocuments(criteres: {
    nom?: string;
    type?: string;
    statut?: string;
    stagiaireNom?: string;
    dateDebut?: Date;
    dateFin?: Date;
  }): Observable<DocumentAttente[]> {
    let params: any = {};

    Object.keys(criteres).forEach(key => {
      const value = criteres[key as keyof typeof criteres];
      if (value) {
        params[key] = value instanceof Date ? value.toISOString() : value;
      }
    });

    return this.http.get<DocumentAttente[]>(`${this.API_BASE_URL}/admin/documents/recherche`, {
      headers: this.getHttpHeaders(),
      params
    }).pipe(
      catchError(this.handleError('rechercherDocuments'))
    );
  }

  /**
   * Exporte les données du dashboard
   */
  exporterDonnees(format: 'CSV' | 'EXCEL', type: 'INSCRIPTIONS' | 'DOCUMENTS' | 'COMPLET'): Observable<Blob> {
    return this.http.get(`${this.API_BASE_URL}/admin/export/${type.toLowerCase()}`, {
      headers: this.getHttpHeaders(),
      params: { format: format.toLowerCase() },
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError('exporterDonnees'))
    );
  }
}
