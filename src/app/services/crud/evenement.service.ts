import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, delay, Observable, of} from 'rxjs';
import {environment} from '../../../environments/environment';
import {MotifAbsence} from '../../models/motif-absence';

export interface Evenement {
  id?: number;
  type: string;
  motif: string;
  date: string;
  stagiaireId: number;
  // autres propriétés selon ton backend
}

@Injectable({
  providedIn: 'root'
})
export class EvenementService {

  private apiUrl = environment.serverUrl + 'api/evenements'; // à adapter selon backend
  private evenements: Evenement[] = [];
  private documents: Document[] = [];
  private evnementsSubject = new BehaviorSubject<Evenement[]>([]);

  // Mock des motifs d'absence
  private motifsAbsence: MotifAbsence[] = [
    { code: 'MALADIE', libelle: 'Maladie', justificationRequise: true },
    { code: 'RENDEZ_VOUS_MEDICAL', libelle: 'Rendez-vous médical', justificationRequise: true },
    { code: 'URGENCE_FAMILIALE', libelle: 'Urgence familiale', justificationRequise: false },
    { code: 'TRANSPORT', libelle: 'Problème de transport', justificationRequise: false },
    { code: 'PERSONNEL', libelle: 'Raison personnelle', justificationRequise: false },
    { code: 'AUTRE', libelle: 'Autre', justificationRequise: false }
  ];

  private motifsRetard: MotifAbsence[] = [
    { code: 'TRANSPORT', libelle: 'Problème de transport', justificationRequise: false },
    { code: 'CIRCULATION', libelle: 'Embouteillages', justificationRequise: false },
    { code: 'PERSONNEL', libelle: 'Raison personnelle', justificationRequise: false },
    { code: 'AUTRE', libelle: 'Autre', justificationRequise: false }
  ];

  constructor(private http: HttpClient) {
    this.loadMockData();
  }

  /**
   * Version originale pour le backend réel
   */
  creerEvenement(evenement: {
    stagiaireId: number;
    type: any;
    dateEvenement: any;
    motif: any;
    description: any;
    documentId: number | undefined
  }): Observable<Evenement> {
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
   * NOUVELLES MÉTHODES pour l'interface enrichie
   */
  getMotifs(type: 'ABSENCE' | 'RETARD'): MotifAbsence[] {
    return type === 'ABSENCE' ? this.motifsAbsence : this.motifsRetard;
  }

  uploadDocument(file: File, evenementId?: number): Observable<Document> {
    if ((environment as any).mockAuth) {
      return this.mockUploadDocument(file);
    }
    // Version réelle pour plus tard
    const formData = new FormData();
    formData.append('file', file);
    if (evenementId) formData.append('evenementId', evenementId.toString());

    return this.http.post<Document>(`${this.apiUrl}/documents`, formData);
  }

  /**
   * MÉTHODES MOCK (pour développement sans backend)
   */
  private mockCreerEvenement(evenement: Omit<Evenement, 'id' | 'dateDeclaration' | 'statut'>): Observable<Evenement> {
    const nouvelEvenement: Evenement = {
      ...evenement,
      id: this.generateId(),
      dateDeclaration: new Date().toISOString(),
      statut: evenement.type === 'RETARD' && !evenement.documentId ? 'JUSTIFIE' : 'EN_ATTENTE'
    };

    return new Observable(observer => {
      setTimeout(() => {
        this.evenements.push(nouvelEvenement);
        this.evnementsSubject.next([...this.evenements]);
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

  private mockUploadDocument(file: File): Observable<Document> {
    const document: Document = {
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
      {id: 1, stagiaireId: 1, type: 'ABSENCE', dateEvenement: '2025-01-15', motif: 'MALADIE', description: 'Grippe', statut: 'JUSTIFIE', documentId: 1, dateDeclaration: '2025-01-14T08:00:00Z'}
    ];
    this.evnementsSubject.next([...this.evenements]);
  }
}


