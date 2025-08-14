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
  stagiaire: {
    lastName: string;
    firstName: string;
    email: string;
  };
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
  nomFichierOriginal?: string;
  typeFichier: string;
  typeDocument?: 'CV' | 'PIECE_IDENTITE' | 'DIPLOME' | 'JUSTIFICATIF' | 'PHOTO' | 'AUTRE';
  stagiaireId: number;
  stagiaire: {
    lastName: string;
    firstName: string;
    email: string;
  };
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

  private readonly API_BASE_URL = environment.serverUrl + 'api';

  // Subjects pour les données en temps réel
  private kpiDataSubject = new BehaviorSubject<KpiData | null>(null);
  private inscriptionsAttenteSubject = new BehaviorSubject<InscriptionAttente[]>([]);
  private documentsAttenteSubject = new BehaviorSubject<DocumentAttente[]>([]);

  // Observables publics
  public kpiData$ = this.kpiDataSubject.asObservable();
  public inscriptionsAttente$ = this.inscriptionsAttenteSubject.asObservable();
  public documentsAttente$ = this.documentsAttenteSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ==================== DONNÉES MOCK ====================

  /**
   * 📊 Données KPI fictives pour développement
   */
  private getMockKpis(): KpiData {
    return {
      nbStagiaires: 156,
      nbFormations: 12,
      nbIntervenants: 8,
      nbDocsAttente: 23,
      nbDocsValidation: 7,
      nbInscriptionsAttente: 15,
      evolutionStagiaires: 12.5,
      evolutionFormations: -2.3
    };
  }

  /**
   * 👥 Inscriptions fictives pour développement
   */
  private getMockInscriptions(): InscriptionAttente[] {
    return [
      {
        id: 1,
        stagiaireId: 101,
        stagiaire: {
          firstName: 'Marie',
          lastName: 'Dupont',
          email: 'marie.dupont@example.com'
        },
        formationId: 1,
        formationNom: 'Développement Web Full Stack',
        statutDossier: 'INCOMPLET',
        dateInscription: new Date('2024-12-01'),
        documentsManquants: ['CV', 'Pièce d\'identité'],
        documentsDeposes: 2,
        documentsRequis: 4,
        priorite: 'HAUTE'
      },
      {
        id: 2,
        stagiaireId: 102,
        stagiaire: {
          firstName: 'Pierre',
          lastName: 'Martin',
          email: 'pierre.martin@example.com'
        },
        formationId: 2,
        formationNom: 'Data Science & IA',
        statutDossier: 'EN_COURS',
        dateInscription: new Date('2024-11-28'),
        documentsManquants: ['Diplôme'],
        documentsDeposes: 3,
        documentsRequis: 4,
        priorite: 'NORMALE'
      },
      {
        id: 3,
        stagiaireId: 103,
        stagiaire: {
          firstName: 'Sophie',
          lastName: 'Bernard',
          email: 'sophie.bernard@example.com'
        },
        formationId: 1,
        formationNom: 'Développement Web Full Stack',
        statutDossier: 'COMPLET',
        dateInscription: new Date('2024-11-25'),
        documentsManquants: [],
        documentsDeposes: 4,
        documentsRequis: 4,
        priorite: 'BASSE'
      }
    ];
  }

  /**
   * 📄 Documents fictifs pour développement
   */
  private getMockDocuments(): DocumentAttente[] {
    return [
      {
        id: 1,
        nomFichier: 'cv_marie_dupont.pdf',
        nomFichierOriginal: 'CV_Marie_DUPONT.pdf',
        typeFichier: 'application/pdf',
        typeDocument: 'CV',
        stagiaireId: 101,
        stagiaire: {
          firstName: 'Marie',
          lastName: 'Dupont',
          email: 'marie.dupont@example.com'
        },
        dateDepot: new Date('2024-12-01'),
        statut: 'EN_ATTENTE',
        taille: 245760, // 240 Ko
        cheminFichier: '/uploads/documents/cv_marie_dupont.pdf'
      },
      {
        id: 2,
        nomFichier: 'diplome_pierre_martin.pdf',
        typeFichier: 'application/pdf',
        typeDocument: 'DIPLOME',
        stagiaireId: 102,
        stagiaire: {
          firstName: 'Pierre',
          lastName: 'Martin',
          email: 'pierre.martin@example.com'
        },
        dateDepot: new Date('2024-11-30'),
        statut: 'EN_COURS',
        taille: 512000, // 500 Ko
        cheminFichier: '/uploads/documents/diplome_pierre_martin.pdf'
      },
      {
        id: 3,
        nomFichier: 'piece_identite_sophie.jpg',
        typeFichier: 'image/jpeg',
        typeDocument: 'PIECE_IDENTITE',
        stagiaireId: 103,
        stagiaire: {
          firstName: 'Sophie',
          lastName: 'Bernard',
          email: 'sophie.bernard@example.com'
        },
        dateDepot: new Date('2024-11-29'),
        statut: 'VALIDE',
        taille: 1024000, // 1 Mo
        cheminFichier: '/uploads/documents/piece_identite_sophie.jpg',
        validePar: 'Admin Test',
        dateValidation: new Date('2024-11-30')
      }
    ];
  }

  // ==================== MÉTHODES PRINCIPALES ====================

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
    // 🔥 Mode mock pour développement
    if ((environment as any).mockAuth) {
      console.log('🎭 Dashboard: Utilisation des données mock KPIs');
      return new Observable(observer => {
        setTimeout(() => {
          const mockData = this.getMockKpis();
          this.kpiDataSubject.next(mockData);
          observer.next(mockData);
          observer.complete();
        }, 500);
      });
    }

    // Mode production avec fallback mock
    return this.http.get<KpiData>(`${this.API_BASE_URL}/admin/kpis`, {
      headers: this.getHttpHeaders()
    }).pipe(
      tap(data => this.kpiDataSubject.next(data)),
      catchError(error => {
        console.warn('API KPIs indisponible, utilisation des données mock');
        const mockData = this.getMockKpis();
        this.kpiDataSubject.next(mockData);
        return [mockData];
      })
    );
  }

  // ==================== INSCRIPTIONS ====================

  /**
   * Récupère les inscriptions en attente
   */
  getInscriptionsAttente(limit: number = 10): Observable<InscriptionAttente[]> {
    // 🔥 Mode mock pour développement
    if ((environment as any).mockAuth) {
      console.log('🎭 Dashboard: Utilisation des données mock Inscriptions');
      return new Observable(observer => {
        setTimeout(() => {
          const mockData = this.getMockInscriptions().slice(0, limit);
          this.inscriptionsAttenteSubject.next(mockData);
          observer.next(mockData);
          observer.complete();
        }, 700);
      });
    }
    // Mode production avec fallback mock
    return this.http.get<InscriptionAttente[]>(`${this.API_BASE_URL}/admin/inscriptions/attente`, {
      headers: this.getHttpHeaders(),
      params: { limit: limit.toString() }
    }).pipe(
      tap(data => this.inscriptionsAttenteSubject.next(data)),
      catchError(error => {
        console.warn('API Inscriptions indisponible, utilisation des données mock');
        const mockData = this.getMockInscriptions().slice(0, limit);
        this.inscriptionsAttenteSubject.next(mockData);
        return [mockData];
      })
    );
  }

  // ==================== DOCUMENTS ====================


  /**
   * Récupère les documents en attente de validation
   */
  getDocumentsAttente(limit: number = 15): Observable<DocumentAttente[]> {
    // 🔥 Mode mock pour développement
    if ((environment as any).mockAuth) {
      console.log('🎭 Dashboard: Utilisation des données mock Documents');
      return new Observable(observer => {
        setTimeout(() => {
          const mockData = this.getMockDocuments().slice(0, limit);
          this.documentsAttenteSubject.next(mockData);
          observer.next(mockData);
          observer.complete();
        }, 600);
      });
    }

    // Mode production avec fallback mock
    return this.http.get<DocumentAttente[]>(`${this.API_BASE_URL}/admin/documents/attente`, {
      headers: this.getHttpHeaders(),
      params: { limit: limit.toString() }
    }).pipe(
      tap(data => this.documentsAttenteSubject.next(data)),
      catchError(error => {
        console.warn('API Documents indisponible, utilisation des données mock');
        const mockData = this.getMockDocuments().slice(0, limit);
        this.documentsAttenteSubject.next(mockData);
        return [mockData];
      })
    );
  }

  // ==================== AUTRES MÉTHODES ====================


  /**
   * Actualise toutes les données du dashboard
   */
  rafraichirToutesDonnees(): Observable<any> {
    return new Observable<boolean>(observer => {
      let completedRequests = 0;
      const totalRequests = 3;
      let hasError = false;

      const checkCompletion = () => {
        completedRequests++;
        if (completedRequests === totalRequests) {
          if (hasError) {
            observer.error(new Error('Erreurs lors du rafraîchissement'));
          } else {
            observer.next(true);
            observer.complete();
          }
        }
      };

      // Requête 1: KPIs
      this.getKpis().subscribe({
        next: (data: KpiData) => checkCompletion(),
        error: (error: any) => {
          console.error('Erreur lors du rafraîchissement des KPIs:', error);
          hasError = true;
          checkCompletion();
        }
      });

      // Requête 2: Inscriptions
      this.getInscriptionsAttente().subscribe({
        next: (data: InscriptionAttente[]) => checkCompletion(),
        error: (error: any) => {
          console.error('Erreur lors du rafraîchissement des inscriptions:', error);
          hasError = true;
          checkCompletion();
        }
      });

      // Requête 3: Documents
      this.getDocumentsAttente().subscribe({
        next: (data: DocumentAttente[]) => checkCompletion(),
        error: (error: any) => {
          console.error('Erreur lors du rafraîchissement des documents:', error);
          hasError = true;
          checkCompletion();
        }
      });
    });
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

  // ==================== UTILITAIRES ====================

  /**
   * Recherche dans les documents
   */
  rechercherDocuments(criteres: {
    nom?: string;
    type?: string;
    statut?: string;
    lastName?: string;
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

}

