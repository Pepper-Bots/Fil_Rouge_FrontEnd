import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// ==================== INTERFACES STAGIAIRE ====================

export interface StagiaireProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  formation?: FormationInfo;
  avatar?: string;
  parcours: string;
  enCoursDeValidation: boolean;
}

export interface FormationInfo {
  id: number;
  nom: string;
  niveau: 'A' | 'B' | 'C'; // Bac+2, Bac+3, Bac+5
  dateDebut: Date;
  dateFin: Date;
  dureeHeures: number;
  progression: number; // 0-100
  intervenant: string;
  statut: 'EN_COURS' | 'EN_ATTENTE' | 'TERMINEE' | 'SUSPENDUE';
  prochainCours?: {
    date: Date;
    matiere: string;
    salle?: string;
  };
}

export interface DossierInscription {
  id: number;
  statutDossier: 'INCOMPLET' | 'COMPLET' | 'EN_COURS' | 'VALIDE';
  documentsRequis: number;
  documentsDeposes: number;
  documentsValides: number;
  documentsManquants: DocumentType[];
  progression: number; // 0-100
  derniereModification: Date;
}

export interface DocumentType {
  type: 'CV' | 'PIECE_IDENTITE' | 'DIPLOME_BAC' | 'DIPLOME_BAC_2' | 'DIPLOME_BAC_3' |
    'JUSTIFICATIF' | 'LETTRE_MOTIVATION' | 'PORTFOLIO' | 'PHOTO' | 'ATTEST_RESP_CIVILE';
  nom: string;
  description: string;
  obligatoire: boolean;
  statut?: 'EN_ATTENTE' | 'VALIDE' | 'REJETE' | 'MANQUANT';
}

export interface EvenementAbsence {
  id: number;
  type: 'ABSENCE' | 'RETARD';
  dateDebut: Date;
  dateFin?: Date;
  motif: string;
  justifie: boolean;
  documentFourni: boolean;
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REJETE';
  commentaireAdmin?: string;
  heuresManquees?: number;
}

export interface NotificationStagiaire {
  id: number;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  titre: string;
  message: string;
  date: Date;
  lu: boolean;
  lien?: string;
}

export interface StatsStagiaire {
  totalRetards: number;
  seuilRetards: number; // 30 max
  totalAbsences: number; // en heures
  seuilAbsences: number; // 50h max
  tauxPresence: number; // 0-100
  alerteActive: boolean;
  niveauAlerte?: 1 | 2 | 3;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardStagiaireService {

  private readonly API_BASE_URL = environment.serverUrl + 'api/stagiaire';

  // BehaviorSubjects pour les données en temps réel
  private profileSubject = new BehaviorSubject<StagiaireProfile | null>(null);
  private dossierSubject = new BehaviorSubject<DossierInscription | null>(null);
  private notificationsSubject = new BehaviorSubject<NotificationStagiaire[]>([]);
  private evenementsSubject = new BehaviorSubject<EvenementAbsence[]>([]);
  private statsSubject = new BehaviorSubject<StatsStagiaire | null>(null);

  // Observables publics
  public profile$ = this.profileSubject.asObservable();
  public dossier$ = this.dossierSubject.asObservable();
  public notifications$ = this.notificationsSubject.asObservable();
  public evenements$ = this.evenementsSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ==================== DONNÉES MOCK POUR DÉVELOPPEMENT ====================

  /**
   * 👤 Profil stagiaire fictif
   */
  private getMockProfile(): StagiaireProfile {
    return {
      id: 5,
      firstName: 'Romain',
      lastName: 'DUPONT',
      email: 'romain.dupont@live.fr',
      avatar: undefined,
      parcours: 'Développeur web',
      enCoursDeValidation: true,
      formation: {
        id: 1,
        nom: 'Développement Web Full Stack',
        niveau: 'B',
        dateDebut: new Date('2024-01-15'),
        dateFin: new Date('2024-07-15'),
        dureeHeures: 500,
        progression: 45,
        intervenant: 'Marc BERNARD',
        statut: 'EN_COURS',
        prochainCours: {
          date: new Date('2025-01-18'),
          matiere: 'Réseaux / UX',
          salle: 'Salle A12'
        }
      }
    };
  }

  /**
   * 📄 Dossier d'inscription fictif
   */
  private getMockDossier(): DossierInscription {
    return {
      id: 1,
      statutDossier: 'INCOMPLET',
      documentsRequis: 4,
      documentsDeposes: 3,
      documentsValides: 2,
      documentsManquants: [
        {
          type: 'PIECE_IDENTITE',
          nom: 'Pièce d\'identité',
          description: 'Carte d\'identité ou passeport en cours de validité',
          obligatoire: true,
          statut: 'MANQUANT'
        }
      ],
      progression: 75,
      derniereModification: new Date('2024-12-01')
    };
  }

  /**
   * 🔔 Notifications fictives
   */
  private getMockNotifications(): NotificationStagiaire[] {
    return [
      {
        id: 1,
        type: 'WARNING',
        titre: 'Document en attente',
        message: 'Votre CV est en cours de validation par l\'administration',
        date: new Date('2024-12-01'),
        lu: false
      },
      {
        id: 2,
        type: 'INFO',
        titre: 'Nouveau cours',
        message: 'Le cours de Réseaux/UX aura lieu demain à 9h30',
        date: new Date('2024-11-30'),
        lu: true
      },
      {
        id: 3,
        type: 'SUCCESS',
        titre: 'Document validé',
        message: 'Votre justificatif a été approuvé',
        date: new Date('2024-11-28'),
        lu: true
      }
    ];
  }

  /**
   * 📊 Événements d'absence fictifs
   */
  private getMockEvenements(): EvenementAbsence[] {
    return [
      {
        id: 1,
        type: 'RETARD',
        dateDebut: new Date('2024-11-25'),
        motif: 'Transport en commun',
        justifie: false,
        documentFourni: false,
        statut: 'EN_ATTENTE',
        heuresManquees: 0.5
      },
      {
        id: 2,
        type: 'ABSENCE',
        dateDebut: new Date('2024-11-20'),
        dateFin: new Date('2024-11-20'),
        motif: 'Rendez-vous médical',
        justifie: true,
        documentFourni: true,
        statut: 'VALIDE',
        heuresManquees: 7
      }
    ];
  }

  /**
   * 📈 Stats fictives
   */
  private getMockStats(): StatsStagiaire {
    return {
      totalRetards: 3,
      seuilRetards: 30,
      totalAbsences: 7, // heures
      seuilAbsences: 50,
      tauxPresence: 92,
      alerteActive: false
    };
  }

  // ==================== HEADERS ET GESTION D'ERREURS ====================

  private getHttpHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  private handleError(operation = 'operation') {
    return (error: any): Observable<never> => {
      console.error(`${operation} failed:`, error);

      let errorMessage = 'Une erreur est survenue';

      if (error.status === 401) {
        errorMessage = 'Session expirée, veuillez vous reconnecter';
      } else if (error.status === 403) {
        errorMessage = 'Accès non autorisé';
      } else if (error.status === 404) {
        errorMessage = 'Ressource non trouvée';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }

      return throwError(() => new Error(errorMessage));
    };
  }

  // ==================== MÉTHODES PRINCIPALES ====================

  /**
   * 👤 Récupère le profil du stagiaire connecté
   */
  getProfile(): Observable<StagiaireProfile> {
    // Mode mock pour développement
    if ((environment as any).mockAuth) {
      console.log('🎭 Dashboard Stagiaire: Utilisation des données mock Profile');
      return new Observable(observer => {
        setTimeout(() => {
          const mockData = this.getMockProfile();
          this.profileSubject.next(mockData);
          observer.next(mockData);
          observer.complete();
        }, 500);
      });
    }

    // Mode production avec fallback mock
    return this.http.get<StagiaireProfile>(`${this.API_BASE_URL}/profile`, {
      headers: this.getHttpHeaders()
    }).pipe(
      tap(data => this.profileSubject.next(data)),
      catchError(error => {
        console.warn('API Profile indisponible, utilisation des données mock');
        const mockData = this.getMockProfile();
        this.profileSubject.next(mockData);
        return [mockData];
      })
    );
  }

  /**
   * 📄 Récupère l'état du dossier d'inscription
   */
  getDossierInscription(): Observable<DossierInscription> {
    if ((environment as any).mockAuth) {
      console.log('🎭 Dashboard Stagiaire: Utilisation des données mock Dossier');
      return new Observable(observer => {
        setTimeout(() => {
          const mockData = this.getMockDossier();
          this.dossierSubject.next(mockData);
          observer.next(mockData);
          observer.complete();
        }, 600);
      });
    }

    return this.http.get<DossierInscription>(`${this.API_BASE_URL}/dossier`, {
      headers: this.getHttpHeaders()
    }).pipe(
      tap(data => this.dossierSubject.next(data)),
      catchError(error => {
        console.warn('API Dossier indisponible, utilisation des données mock');
        const mockData = this.getMockDossier();
        this.dossierSubject.next(mockData);
        return [mockData];
      })
    );
  }

  /**
   * 🔔 Récupère les notifications
   */
  getNotifications(limit: number = 10): Observable<NotificationStagiaire[]> {
    if ((environment as any).mockAuth) {
      console.log('🎭 Dashboard Stagiaire: Utilisation des données mock Notifications');
      return new Observable(observer => {
        setTimeout(() => {
          const mockData = this.getMockNotifications().slice(0, limit);
          this.notificationsSubject.next(mockData);
          observer.next(mockData);
          observer.complete();
        }, 400);
      });
    }

    return this.http.get<NotificationStagiaire[]>(`${this.API_BASE_URL}/notifications`, {
      headers: this.getHttpHeaders(),
      params: { limit: limit.toString() }
    }).pipe(
      tap(data => this.notificationsSubject.next(data)),
      catchError(error => {
        console.warn('API Notifications indisponible, utilisation des données mock');
        const mockData = this.getMockNotifications().slice(0, limit);
        this.notificationsSubject.next(mockData);
        return [mockData];
      })
    );
  }

  /**
   * 📊 Récupère les événements d'absence/retard
   */
  getEvenements(): Observable<EvenementAbsence[]> {
    if ((environment as any).mockAuth) {
      console.log('🎭 Dashboard Stagiaire: Utilisation des données mock Événements');
      return new Observable(observer => {
        setTimeout(() => {
          const mockData = this.getMockEvenements();
          this.evenementsSubject.next(mockData);
          observer.next(mockData);
          observer.complete();
        }, 700);
      });
    }

    return this.http.get<EvenementAbsence[]>(`${this.API_BASE_URL}/evenements`, {
      headers: this.getHttpHeaders()
    }).pipe(
      tap(data => this.evenementsSubject.next(data)),
      catchError(error => {
        console.warn('API Événements indisponible, utilisation des données mock');
        const mockData = this.getMockEvenements();
        this.evenementsSubject.next(mockData);
        return [mockData];
      })
    );
  }

  /**
   * 📈 Récupère les statistiques du stagiaire
   */
  getStats(): Observable<StatsStagiaire> {
    if ((environment as any).mockAuth) {
      console.log('🎭 Dashboard Stagiaire: Utilisation des données mock Stats');
      return new Observable(observer => {
        setTimeout(() => {
          const mockData = this.getMockStats();
          this.statsSubject.next(mockData);
          observer.next(mockData);
          observer.complete();
        }, 800);
      });
    }

    return this.http.get<StatsStagiaire>(`${this.API_BASE_URL}/stats`, {
      headers: this.getHttpHeaders()
    }).pipe(
      tap(data => this.statsSubject.next(data)),
      catchError(error => {
        console.warn('API Stats indisponible, utilisation des données mock');
        const mockData = this.getMockStats();
        this.statsSubject.next(mockData);
        return [mockData];
      })
    );
  }

  /**
   * 🔄 Actualise toutes les données du dashboard
   */
  rafraichirToutesDonnees(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      let completedRequests = 0;
      const totalRequests = 5;
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

      // Toutes les requêtes en parallèle
      this.getProfile().subscribe({
        next: () => checkCompletion(),
        error: () => { hasError = true; checkCompletion(); }
      });

      this.getDossierInscription().subscribe({
        next: () => checkCompletion(),
        error: () => { hasError = true; checkCompletion(); }
      });

      this.getNotifications().subscribe({
        next: () => checkCompletion(),
        error: () => { hasError = true; checkCompletion(); }
      });

      this.getEvenements().subscribe({
        next: () => checkCompletion(),
        error: () => { hasError = true; checkCompletion(); }
      });

      this.getStats().subscribe({
        next: () => checkCompletion(),
        error: () => { hasError = true; checkCompletion(); }
      });
    });
  }

  // ==================== ACTIONS SPÉCIFIQUES ====================

  /**
   * ✅ Marque une notification comme lue
   */
  marquerNotificationLue(notificationId: number): Observable<any> {
    return this.http.put(`${this.API_BASE_URL}/notifications/${notificationId}/lue`, {}, {
      headers: this.getHttpHeaders()
    }).pipe(
      tap(() => {
        // Mettre à jour localement
        const notifications = this.notificationsSubject.value;
        const notification = notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.lu = true;
          this.notificationsSubject.next([...notifications]);
        }
      }),
      catchError(this.handleError('marquerNotificationLue'))
    );
  }

  /**
   * 📝 Déclare un événement (absence/retard)
   */
  declarerEvenement(evenement: {
    type: 'ABSENCE' | 'RETARD';
    dateDebut: Date;
    dateFin?: Date;
    motif: string;
    document?: File;
  }): Observable<any> {
    const formData = new FormData();
    formData.append('type', evenement.type);
    formData.append('dateDebut', evenement.dateDebut.toISOString());
    if (evenement.dateFin) {
      formData.append('dateFin', evenement.dateFin.toISOString());
    }
    formData.append('motif', evenement.motif);
    if (evenement.document) {
      formData.append('document', evenement.document);
    }

    return this.http.post(`${this.API_BASE_URL}/evenements`, formData, {
      headers: new HttpHeaders({
        'Authorization': localStorage.getItem('auth_token') ?
          `Bearer ${localStorage.getItem('auth_token')}` : ''
      })
    }).pipe(
      tap(() => {
        // Actualiser les événements après déclaration
        this.getEvenements().subscribe();
        this.getStats().subscribe();
      }),
      catchError(this.handleError('declarerEvenement'))
    );
  }

  /**
   * 📱 Met à jour les préférences de notification
   */
  updatePreferencesNotification(preferences: {
    emailActif: boolean;
    pushActif: boolean;
  }): Observable<any> {
    return this.http.put(`${this.API_BASE_URL}/preferences-notifications`, preferences, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError('updatePreferencesNotification'))
    );
  }

  // ==================== UTILITAIRES ====================

  /**
   * 📊 Calcule le nombre de notifications non lues
   */
  getNombreNotificationsNonLues(): number {
    return this.notificationsSubject.value.filter(n => !n.lu).length;
  }

  /**
   * ⚠️ Vérifie si le stagiaire a des alertes actives
   */
  hasAlerteActive(): boolean {
    const stats = this.statsSubject.value;
    return stats?.alerteActive || false;
  }

  /**
   * 📈 Retourne le pourcentage de progression du dossier
   */
  getProgressionDossier(): number {
    const dossier = this.dossierSubject.value;
    return dossier?.progression || 0;
  }

  // Ajoutez cette méthode à votre DashboardStagiaireService existant

  /**
   * 🚀 Initialise toutes les données du stagiaire après connexion
   * À appeler après un login réussi
   */
  async initializeStagiaireData(): Promise<void> {
    console.log('🚀 Initialisation des données du stagiaire...');

    try {
      // Charger toutes les données en parallèle
      await Promise.all([
        this.getProfile().toPromise(),
        this.getDossierInscription().toPromise(),
        this.getNotifications(5).toPromise(),
        this.getEvenements().toPromise(),
        this.getStats().toPromise()
      ]);

      console.log('✅ Données du stagiaire initialisées avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
      throw error;
    }
  }

  /**
   * 🔄 Version Observable pour l'initialisation
   */
  initializeStagiaireDataObservable(): Observable<boolean> {
    return this.rafraichirToutesDonnees();
  }
}
