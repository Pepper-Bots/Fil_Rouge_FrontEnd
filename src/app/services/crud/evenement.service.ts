import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, delay, Observable, of} from 'rxjs';
import {environment} from '../../../environments/environment';
import {Evenement, MotifAbsence, DocumentEvenement} from '../../models/evenement';


@Injectable({
  providedIn: 'root'
})
export class EvenementService {

  private apiUrl = environment.serverUrl + 'api/evenements'; // à adapter selon backend
  private evenements: Evenement[] = [];
  private documents: DocumentEvenement[] = [];
  private evenementsSubject = new BehaviorSubject<Evenement[]>([]);

  constructor(private http: HttpClient) {
    this.loadMockData();
  }

  /**
   * Créer une déclaration d'événement
   */
  creerEvenement(evenement: Evenement): Observable<Evenement> {
    if ((environment as any).mockAuth) {
      return this.mockCreerEvenement(evenement);
    }
    return this.http.post<Evenement>(this.apiUrl, evenement);
  }

  /**
   * Version originale pour le backend réel
   * Récupérer la liste des événements d'un stagiaire
   */
  getEvenementsParStagiaire(stagiaireId: number): Observable<Evenement[]> {
    if ((environment as any).mockAuth) {
      return this.mockGetEvenements(stagiaireId);
    }
    return this.http.get<Evenement[]>(`${this.apiUrl}/stagiaire/${stagiaireId}`);
  }

  /**
   * Récupérer les motifs selon le type d'événement
   */
  // Mock des motifs d'absence
  getMotifs(type: 'ABSENCE' | 'RETARD'): MotifAbsence[] {
    const motifsAbsence: MotifAbsence[] = [
      { code: 'MALADIE', libelle: 'Maladie', justificationRequise: true },
      { code: 'RENDEZ_VOUS_MEDICAL', libelle: 'Rendez-vous médical', justificationRequise: true },
      { code: 'URGENCE_FAMILIALE', libelle: 'Urgence familiale', justificationRequise: false },
      { code: 'TRANSPORT', libelle: 'Problème de transport', justificationRequise: false },
      { code: 'PERSONNEL', libelle: 'Raison personnelle', justificationRequise: false },
      { code: 'AUTRE', libelle: 'Autre', justificationRequise: false }
    ];

    const motifsRetard: MotifAbsence[] = [
      { code: 'TRANSPORT', libelle: 'Problème de transport', justificationRequise: false },
      { code: 'CIRCULATION', libelle: 'Embouteillages', justificationRequise: false },
      { code: 'PERSONNEL', libelle: 'Raison personnelle', justificationRequise: false },
      { code: 'AUTRE', libelle: 'Autre', justificationRequise: false }
    ];

    return type === 'ABSENCE' ? motifsAbsence : motifsRetard;
  }

  /**
   * NOUVELLES MÉTHODES pour l'interface enrichie
   */
  uploadDocument(file: File): Observable<DocumentEvenement> {
    if ((environment as any).mockAuth) {
      return this.mockUploadDocument(file);
    }

    // Version réelle pour plus tard
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<DocumentEvenement>(`${this.apiUrl}/documents`, formData);
  }

  // === MÉTHODES MOCK (pour développement sans backend) ===


  private mockCreerEvenement(evenement: Evenement): Observable<Evenement> {
    const nouvelEvenement: Evenement = {
      ...evenement,
      id: this.generateId()
    };

    return new Observable(observer => {
      setTimeout(() => {
        this.evenements.push(nouvelEvenement);
        this.evenementsSubject.next([...this.evenements]);
        console.log('✅ Événement créé (mock):', nouvelEvenement);
        observer.next(nouvelEvenement);
        observer.complete();
      }, 1000);
    });
  }

  private mockGetEvenements(stagiaireId: number): Observable<Evenement[]> {
    const evenements = this.evenements.filter(e => e.stagiaireId === stagiaireId);
    return of(evenements).pipe(delay(500));
  }

  private mockUploadDocument(file: File): Observable<DocumentEvenement> {
    const document: DocumentEvenement = {
      id: this.generateId(),
      nom: file.name,
      type: file.type,
      taille: file.size,
      statut: 'EN_ATTENTE',
      dateUpload: new Date().toISOString(),
      url: URL.createObjectURL(file)
    };

    return new Observable(observer => {
      setTimeout(() => {
        this.documents.push(document);
        console.log('📎 Document uploadé (mock):', document);
        observer.next(document);
        observer.complete();
      }, 1000);
    });
  }

  private generateId(): number {
    return Math.floor(Math.random() * 10000) + 1;
  }

  private loadMockData(): void {
    this.evenements = [
      {
        id: 1,
        stagiaireId: 1,
        type: 'ABSENCE',
        date: '2025-01-15',
        motif: 'MALADIE'
      }
    ];
    this.evenementsSubject.next([...this.evenements]);
  }
}


