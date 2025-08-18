// src/app/services/crud/document.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {BehaviorSubject, Observable, of, tap, throwError} from 'rxjs';
import {TypeDocument} from '../../models/type-document.enum';
import { Document } from '../../models/document';
import { Formation} from '../../models/formation';
import { environment } from '../../../environments/environment';
import {catchError} from 'rxjs/operators';

export interface DocumentValidation {
  Statut: string; // 'VALIDÉ' | 'REFUSÉ'
  Commentaire?: string;
}

export interface StatutDossierFormation {
  id: number;
  nom: string;
  description: string;
  pourcentageCompletion: number;
  documentsRequis: TypeDocument[];
  documentsUploades: TypeDocument[];
  statutDossier: string; // 'INCOMPLET', 'COMPLET', 'EN_VALIDATION', 'VALIDE'
  nombreDocumentsRequis: number;
  nombreDocumentsUploades: number;
  nombreDocumentsManquants: number;
}

// Garder DocumentRequis mais simplifier :
export interface DocumentRequis {
  typeDocument: TypeDocument;
  obligatoire: boolean;
  transmis: boolean;
  statut: string; // 'VALIDÉ', 'EN_ATTENTE', 'REFUSÉ', 'MANQUANT'
  commentaire?: string;
  fichier?: string;
  dateDepot?: string;
}

// Simplifier DossierStatut :
export interface DossierStatut {
  pourcentageCompletion: number;
  statut: string;
  documentsRequis: DocumentRequis[];
}

// ===== INTERFACES POUR VALIDATION =====

interface DocumentUploadResponse {
  success: boolean;
  message: string;
  documentId?: string;
}

interface ValidationStats {
  totalEnAttente: number;
  totalValides: number;
  totalRejetes: number;
  validesAujourdhui: number;
  rejetesAujourdhui: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private readonly API_BASE_URL = environment.serverUrl + 'api';

  // Subject pour notifier les changements de documents
  private documentsSubject = new BehaviorSubject<Document[]>([]);
  public documents$ = this.documentsSubject.asObservable();

  // Cache des types de documents
  private typesDocuments: { [key: string]: string } = {
    'CV': 'Curriculum Vitae',
    'LETTRE_MOTIVATION': 'Lettre de motivation',
    'PORTFOLIO': 'Portfolio',
    'DIPLOME_BAC': 'Diplôme BAC',
    'DIPLOME_BAC_2': 'Diplôme BAC+2',
    'DIPLOME_BAC_3': 'Diplôme BAC+3',
    'PIECE_IDENTITE': 'Pièce d\'identité',
    'ATTEST_RESP_CIVILE': 'Attestation responsabilité civile',
    'JUSTIF_SITUATION': 'Justificatif de situation',
    'JUSTIFICATIF': 'Justificatif',
    'AUTRE': 'Autre document'
  };

  constructor(private http: HttpClient) {}

  // ==================== DONNÉES MOCK POUR DÉVELOPPEMENT ====================

  private getMockFormations(): Formation[] {
    return [
      {
        id: 1,
        nom: 'Concepteur Développeur d\'Applications',
        description: 'Formation intensive de 6 mois en développement web et mobile'
      },
      {
        id: 2,
        nom: 'Technicien Supérieur Systèmes et Réseaux',
        description: 'Formation en administration systèmes et réseaux'
      },
      {
        id: 3,
        nom: 'Designer UX/UI',
        description: 'Formation en conception d\'interfaces utilisateur'
      }
    ];
  }

  private getMockDocumentsRequis(): DocumentRequis[] {
    return [
      {
        typeDocument: TypeDocument.CV,
        obligatoire: true,
        transmis: true,
        statut: 'VALIDE'
      },
      {
        typeDocument: TypeDocument.PIECE_IDENTITE,
        obligatoire: true,
        transmis: true,
        statut: 'EN_ATTENTE'
      },
      {
        typeDocument: TypeDocument.DIPLOME_BAC,
        obligatoire: true,
        transmis: false,
        statut: 'MANQUANT'
      },
      {
        typeDocument: TypeDocument.LETTRE_MOTIVATION,
        obligatoire: false,
        transmis: true,
        statut: 'VALIDE'
      }
    ];
  }

  private getMockStatutDossierFormation(): StatutDossierFormation {
    return {
      id: 1,
      nom: 'Concepteur Développeur d\'Applications',
      description: 'Formation intensive de 6 mois',
      pourcentageCompletion: 67,
      documentsRequis: [TypeDocument.CV, TypeDocument.PIECE_IDENTITE, TypeDocument.DIPLOME_BAC],
      documentsUploades: [TypeDocument.CV, TypeDocument.PIECE_IDENTITE],
      statutDossier: 'EN_VALIDATION',
      nombreDocumentsRequis: 3,
      nombreDocumentsUploades: 2,
      nombreDocumentsManquants: 1
    };
  }

  // ✅ Mock pour formations avec statut
  private getMockFormationsAvecStatut(): StatutDossierFormation[] {
    // Liste des formations où le stagiaire est INSCRIT (a un dossier)
    const formationsInscrites = [1, 10]; // IDs des formations où le stagiaire 5 est inscrit

    return [
      // 🟢 FORMATIONS AVEC INSCRIPTION (pourcentage visible)
      {
        id: 1,
        nom: 'Développement Web Front-End',
        description: 'Apprendre HTML, CSS, JavaScript et React.',
        pourcentageCompletion: 67,
        documentsRequis: [TypeDocument.CV, TypeDocument.LETTRE_MOTIVATION, TypeDocument.PORTFOLIO],
        documentsUploades: [TypeDocument.CV, TypeDocument.LETTRE_MOTIVATION],
        statutDossier: 'EN_VALIDATION',
        nombreDocumentsRequis: 3,
        nombreDocumentsUploades: 2,
        nombreDocumentsManquants: 1
      },
      {
        id: 10,
        nom: 'Initiation à la cybersécurité',
        description: 'Panorama des menaces et bonnes pratiques en entreprise.',
        pourcentageCompletion: 50,
        documentsRequis: [TypeDocument.CV, TypeDocument.PIECE_IDENTITE],
        documentsUploades: [TypeDocument.CV],
        statutDossier: 'INCOMPLET',
        nombreDocumentsRequis: 2,
        nombreDocumentsUploades: 1,
        nombreDocumentsManquants: 1
      },

      // 🔵 FORMATIONS DISPONIBLES (pas d'inscription = pourcentage à 0)
      {
        id: 2,
        nom: 'Développement Web Back-End',
        description: 'Apprentissage de Node.js, Express et bases de données.',
        pourcentageCompletion: 0, // ← Pas inscrit = 0%
        documentsRequis: [TypeDocument.CV, TypeDocument.DIPLOME_BAC, TypeDocument.PIECE_IDENTITE],
        documentsUploades: [], // ← Aucun document uploadé
        statutDossier: 'NON_INSCRIT', // ← Nouveau statut
        nombreDocumentsRequis: 3,
        nombreDocumentsUploades: 0,
        nombreDocumentsManquants: 3
      },
      {
        id: 3,
        nom: 'Full Stack Web',
        description: 'Formation complète front-end et back-end avec projets pratiques.',
        pourcentageCompletion: 0,
        documentsRequis: [TypeDocument.CV, TypeDocument.LETTRE_MOTIVATION, TypeDocument.DIPLOME_BAC_2, TypeDocument.PORTFOLIO],
        documentsUploades: [],
        statutDossier: 'NON_INSCRIT',
        nombreDocumentsRequis: 4,
        nombreDocumentsUploades: 0,
        nombreDocumentsManquants: 4
      },
      {
        id: 4,
        nom: 'Sécurité Réseaux',
        description: 'Introduction à la sécurité des réseaux informatiques.',
        pourcentageCompletion: 0,
        documentsRequis: [TypeDocument.PIECE_IDENTITE, TypeDocument.DIPLOME_BAC, TypeDocument.ATTEST_RESP_CIVILE],
        documentsUploades: [],
        statutDossier: 'NON_INSCRIT',
        nombreDocumentsRequis: 3,
        nombreDocumentsUploades: 0,
        nombreDocumentsManquants: 3
      },
      {
        id: 5,
        nom: 'Pentesting - Tests d\'intrusion',
        description: 'Découverte des techniques d\'intrusion et d\'audit.',
        pourcentageCompletion: 0,
        documentsRequis: [TypeDocument.CV, TypeDocument.JUSTIF_SITUATION, TypeDocument.DIPLOME_BAC_3],
        documentsUploades: [],
        statutDossier: 'NON_INSCRIT',
        nombreDocumentsRequis: 3,
        nombreDocumentsUploades: 0,
        nombreDocumentsManquants: 3
      },
      {
        id: 6,
        nom: 'Développement Web avec Java Spring',
        description: 'Conception d\'applications web sécurisées avec Spring Boot.',
        pourcentageCompletion: 0,
        documentsRequis: [TypeDocument.CV, TypeDocument.DIPLOME_BAC_2, TypeDocument.PORTFOLIO],
        documentsUploades: [],
        statutDossier: 'NON_INSCRIT',
        nombreDocumentsRequis: 3,
        nombreDocumentsUploades: 0,
        nombreDocumentsManquants: 3
      },
      {
        id: 7,
        nom: 'Cyberdéfense et SOC',
        description: 'Mise en place d\'un centre opérationnel de sécurité.',
        pourcentageCompletion: 0,
        documentsRequis: [TypeDocument.PIECE_IDENTITE, TypeDocument.CV, TypeDocument.ATTEST_RESP_CIVILE],
        documentsUploades: [],
        statutDossier: 'NON_INSCRIT',
        nombreDocumentsRequis: 3,
        nombreDocumentsUploades: 0,
        nombreDocumentsManquants: 3
      },
      {
        id: 8,
        nom: 'Développement Web avec PHP et Laravel',
        description: 'Projet web avec PHP, MySQL et le framework Laravel.',
        pourcentageCompletion: 0,
        documentsRequis: [TypeDocument.CV, TypeDocument.LETTRE_MOTIVATION, TypeDocument.PORTFOLIO],
        documentsUploades: [],
        statutDossier: 'NON_INSCRIT',
        nombreDocumentsRequis: 3,
        nombreDocumentsUploades: 0,
        nombreDocumentsManquants: 3
      },
      {
        id: 9,
        nom: 'Sécurité des Applications Web',
        description: 'Protection des applis web contre les vulnérabilités courantes.',
        pourcentageCompletion: 0,
        documentsRequis: [TypeDocument.CV, TypeDocument.JUSTIFICATIF, TypeDocument.ATTEST_RESP_CIVILE],
        documentsUploades: [],
        statutDossier: 'NON_INSCRIT',
        nombreDocumentsRequis: 3,
        nombreDocumentsUploades: 0,
        nombreDocumentsManquants: 3
      }
    ];
  }

  private getMockDossierStatut(): DossierStatut {
    const documentsRequis = this.getMockDocumentsRequis();
    const totalRequis = documentsRequis.filter(d => d.obligatoire).length;
    const totalUploades = documentsRequis.filter(d => d.obligatoire && d.transmis).length;
    const pourcentage = Math.round((totalUploades / totalRequis) * 100);

    return {
      pourcentageCompletion: pourcentage,
      documentsRequis: documentsRequis,
      statut: pourcentage === 100 ? 'COMPLET' : 'INCOMPLET'
    };
  }

  private getMockDocumentsEnAttente(): Document[] {
    return [
      {
        id: 1,
        type: TypeDocument.CV,
        nomFichier: 'CV_Marie_Dupont.pdf',
        stagiaire: {
          id: 101,
          firstName: 'Marie',
          lastName: 'Dupont',
          email: 'marie.dupont@test.com',
          enabled: true,
          nomRole: 'STAGIAIRE'
        },
        statut: {
          id: 1,
          nom: 'EN_ATTENTE'
        },
        dateDepot: '2024-12-01T10:30:00',
        commentaire: '',
        taille: 245760, // 240 KB
        typeFichier: 'application/pdf'
      },
      {
        id: 2,
        type: TypeDocument.PIECE_IDENTITE,
        nomFichier: 'CNI_Pierre_Martin.jpg',
        stagiaire: {
          id: 102,
          firstName: 'Pierre',
          lastName: 'Martin',
          email: 'pierre.martin@test.com',
          enabled: true,
          nomRole: 'STAGIAIRE'
        },
        statut: {
          id: 1,
          nom: 'EN_ATTENTE'
        },
        dateDepot: '2024-11-30T14:15:00',
        commentaire:'',
        taille: 1024000, // 1 MB
        typeFichier: 'image/jpeg'
      }
    ];
  }

  // ==================== MÉTHODES PRINCIPALES ====================

  /**
   * Headers HTTP avec authentification
   */
  private getHttpHeaders(includeContentType = true): HttpHeaders {
    const token = localStorage.getItem('jwt');
    const headers: any = {
      'Authorization': token ? `Bearer ${token}` : ''
    };

    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }

    return new HttpHeaders(headers);
  }

  /**
   * Récupérer toutes les formations disponibles
   */
  getFormations(): Observable<Formation[]> {
    // 🔥 Mode mock pour développement
    if ((environment as any).mockAuth) {
      console.log('🎭 Document: Formations simulées');
      return new Observable(observer => {
        setTimeout(() => {
          observer.next(this.getMockFormations());
          observer.complete();
        }, 500);
      });
    }

    // Mode production
    return this.http.get<Formation[]>(`${this.API_BASE_URL}/formation/formations`, {
      headers: this.getHttpHeaders()
    }).pipe(catchError(this.handleError));

  }

  /**
   * Récupérer les formations d'un stagiaire spécifique
   */
  getFormationsByStagiaire(userId: number): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.API_BASE_URL}/documents/stagiaire/${userId}/formations`, {
      headers: this.getHttpHeaders()
    });
  }

  /**
   * Récupérer les documents requis pour une formation
   */
  getDocumentsRequisFormation(formationId: number): Observable<TypeDocument[]> {
    return this.http.get<TypeDocument[]>(`${this.API_BASE_URL}/documents/formation/${formationId}/documents-requis`, {
      headers: this.getHttpHeaders()
    });
  }

  /**
   * Récupérer le statut du dossier d'un stagiaire pour une formation donnée
   */
  getStatutDossierFormation(formationId: number, stagiaireId: number): Observable<StatutDossierFormation> {
    // 🔥 Mode mock pour développement
    if ((environment as any).mockAuth) {
      console.log('🎭 Document: Statut dossier formation simulé', { formationId, stagiaireId });
      return new Observable(observer => {
        setTimeout(() => {
          observer.next(this.getMockStatutDossierFormation());
          observer.complete();
        }, 700);
      });
    }

    // Mode production
    return this.http.get<StatutDossierFormation>(`${this.API_BASE_URL}/documents/formation/${formationId}/statut/${stagiaireId}`, {
      headers: this.getHttpHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * Upload d'un document pour une formation spécifique
   */
  uploadDocumentForFormation(formationId: number, userId: number, file: File, type: TypeDocument): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('userId', userId.toString());

    return this.http.post(`${this.API_BASE_URL}/documents/formations/${formationId}/upload`, formData, {
      headers: this.getHttpHeaders(false)
    }).pipe(
      tap(response => {
        console.log('Document uploadé pour formation:', response);
        this.refreshDocumentsEnAttente();
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Upload d'un document pour un dossier spécifique
   */
  uploadDocumentForDossier(dossierId: number, file: File, type: TypeDocument): Observable<any> {
    // 🔥 Mode mock pour développement
    if ((environment as any).mockAuth) {
      console.log('🎭 Document: Upload simulé', { dossierId, type, fileName: file.name });
      return new Observable(observer => {
        setTimeout(() => {
          observer.next({
            success: true,
            message: 'Document uploadé avec succès',
            documentId: Date.now()
          });
          observer.complete();
        }, 1500);
      });
    }

    // Mode production
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.http.post(`${this.API_BASE_URL}/documents/dossier/${dossierId}/upload`, formData, {
      headers: this.getHttpHeaders(false)
    }).pipe(
      tap(response => {
        console.log('Document uploadé pour dossier:', response);
        this.refreshDocumentsEnAttente();
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Récupérer toutes les formations avec statut
   */
  getFormationsAvecStatutDocuments(stagiaireId: number): Observable<StatutDossierFormation[]> {
    // 🔥 Mode mock pour développement
    if ((environment as any).mockAuth) {
      console.log('🎭 Document: Formations avec statut simulées pour stagiaire', stagiaireId);
      return new Observable(observer => {
        setTimeout(() => {
          observer.next(this.getMockFormationsAvecStatut()); // Array de formations
          observer.complete();
        }, 800);
      });
    }

    // Mode production - utilise ton nouvel endpoint
    return this.http.get<StatutDossierFormation[]>(`${this.API_BASE_URL}/documents/stagiaire/${stagiaireId}/formations-avec-statut`, {
      headers: this.getHttpHeaders()
    }).pipe(catchError(this.handleError));
  }

  // ======= METHODES POUR VALIDATION ====

  /**
   * Documents en attente de validation (admin)
   */
  getDocumentsEnAttente(): Observable<Document[]> {
    // 🔥 Mode mock pour développement
    if ((environment as any).mockAuth) {
      console.log('🎭 Document: Documents en attente simulés');
      return new Observable(observer => {
        setTimeout(() => {
          observer.next(this.getMockDocumentsEnAttente());
          observer.complete();
        }, 600);
      });
    }

    return this.http.get<Document[]>(`${this.API_BASE_URL}/documents/en-attente`, {
      headers: this.getHttpHeaders()
    }).pipe(
      tap(documents => {
        console.log('Documents en attente récupérés:', documents);
        this.documentsSubject.next(documents);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Validation d'un document (admin)
   */
  validerDocument(documentId: number, validation: DocumentValidation): Observable<any> {
    // 🔥 Mode mock pour développement
    if ((environment as any).mockAuth) {
      console.log('🎭 Document: Validation simulée', { documentId, validation });
      return new Observable(observer => {
        setTimeout(() => {
          observer.next({
            success: true,
            message: `Document ${validation.Statut.toLowerCase()} avec succès`
          });
          observer.complete();
        }, 1000);
      });
    }

    return this.http.put(`${this.API_BASE_URL}/documents/valider/${documentId}`, validation, {
      headers: this.getHttpHeaders()
    }).pipe(
      tap(() => {
        console.log(`Document ${documentId} ${validation.Statut.toLowerCase()}`);
        this.refreshDocumentsEnAttente();
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Refuse un document avec motif
   */
  rejeterDocument(documentId: number, motif: string): Observable<any> {
    const validation: DocumentValidation = {
      Statut: 'REFUSÉ',
      Commentaire: motif
    };

    return this.validerDocument(documentId, validation);
  }

  /**
   * Téléchargement d'un document
   */
  downloadDocument(documentId: number): Observable<Blob> {
    // 🔥 Mode mock pour développement
    if ((environment as any).mockAuth) {
      console.log('🎭 Document: Téléchargement simulé', documentId);
      const mockContent = 'Contenu du document simulé';
      const blob = new Blob([mockContent], { type: 'application/pdf' });
      return of(blob);
    }

    // Mode production
    return this.http.get(`${this.API_BASE_URL}/documents/download/${documentId}`, {
      headers: this.getHttpHeaders(false),
      responseType: 'blob'
    }).pipe(catchError(this.handleError));
  }

  /**
   * Suppression d'un document
   */
  deleteDocument(documentId: number): Observable<any> {
    // 🔥 Mode mock pour développement
    if ((environment as any).mockAuth) {
      console.log('🎭 Document: Suppression simulée', documentId);
      return new Observable(observer => {
        setTimeout(() => {
          observer.next({ success: true });
          observer.complete();
        }, 500);
      });
    }

    return this.http.delete(`${this.API_BASE_URL}/documents/${documentId}`, {
      headers: this.getHttpHeaders()
    }).pipe(
      tap(() => {
        console.log(`Document ${documentId} supprimé`);
        this.refreshDocumentsEnAttente();
      }),
      catchError(this.handleError)
    );
  }

  // ==================== MÉTHODES UTILITAIRES ====================

  /**
   * Nom d'affichage pour les types de documents
   */
  getTypeDisplayName(type: TypeDocument): string {
    const displayNames: { [key in TypeDocument]: string } = {
      [TypeDocument.PIECE_IDENTITE]: 'Pièce d\'identité',
      [TypeDocument.DIPLOME_BAC]: 'Diplôme BAC',
      [TypeDocument.DIPLOME_BAC_2]: 'Diplôme BAC+2',
      [TypeDocument.DIPLOME_BAC_3]: 'Diplôme BAC+3',
      [TypeDocument.CV]: 'CV',
      [TypeDocument.LETTRE_MOTIVATION]: 'Lettre de motivation',
      [TypeDocument.JUSTIF_SITUATION]: 'Justificatif de situation',
      [TypeDocument.JUSTIFICATIF]: 'Justificatif',
      [TypeDocument.PORTFOLIO]: 'Portfolio',
      [TypeDocument.ATTEST_RESP_CIVILE]: 'Attestation responsabilité civile',
      [TypeDocument.AUTRE]: 'Autre'
    };
    return displayNames[type] || type;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'VALIDÉ':
      case 'VALIDE': return 'text-green-600';
      case 'EN_ATTENTE': return 'text-yellow-600';
      case 'REFUSÉ':
      case 'REJETE': return 'text-red-600';
      case 'MANQUANT': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'VALIDÉ':
      case 'VALIDE': return 'check_circle';
      case 'EN_ATTENTE': return 'schedule';
      case 'REFUSÉ':
      case 'REJETE': return 'cancel';
      case 'MANQUANT': return 'error_outline';
      default: return 'help_outline';
    }
  }

  /**
   * Upload d'un document simple (rétrocompatibilité)
   */
  uploadDocument(type: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', file);

    return this.http.post(`${this.API_BASE_URL}/documents`, formData);
  }

  /**
   * Formations d'un stagiaire (alias pour rétrocompatibilité)
   */
  getFormationByStagiaire(stagiaireId: number): Observable<Formation[]> {
    return this.getFormationsByStagiaire(stagiaireId);
  }

  // ===== AJOUTEZ CES MÉTHODES À LA FIN DE VOTRE DocumentService EXISTANT =====

  /**
   * Valide plusieurs documents en lot
   */
  validerDocumentsEnLot(documentIds: number[], commentaire?: string): Observable<any> {
    const url = `${this.API_BASE_URL}/documents/validation/batch`;
    const payload = {
      documentIds,
      statut: 'VALIDÉ',
      commentaire: commentaire || 'Validation en lot'
    };

    if ((environment as any).mockAuth) {
      console.log('🎭 Document: Validation en lot simulée', payload);
      return new Observable(observer => {
        setTimeout(() => {
          observer.next({
            success: true,
            message: `${documentIds.length} documents validés en lot`
          });
          observer.complete();
        }, 1500);
      });
    }

    return this.http.post(url, payload, { headers: this.getHttpHeaders() })
      .pipe(
        tap(() => {
          console.log(`${documentIds.length} documents validés en lot`);
          this.refreshDocumentsEnAttente();
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Récupère les statistiques de validation
   */
  getValidationStats(): Observable<any> {
    if ((environment as any).mockAuth) {
      console.log('🎭 Document: Stats de validation simulées');
      return of({
        totalEnAttente: 12,
        totalValides: 245,
        totalRejetes: 18,
        validesAujourdhui: 8,
        rejetesAujourdhui: 2
      });
    }

    return this.http.get(`${this.API_BASE_URL}/documents/stats/validation`, {
      headers: this.getHttpHeaders()
    }).pipe(catchError(this.handleError));
  }

  /**
   * Recherche des documents par critères
   */
  searchDocuments(criteria: {
    type?: string;
    statut?: string;
    stagiaireId?: string;
    dateDebut?: string;
    dateFin?: string;
    nomFichier?: string;
  }): Observable<Document[]> {
    const url = `${this.API_BASE_URL}/documents/search`;

    return this.http.post<Document[]>(url, criteria, { headers: this.getHttpHeaders() })
      .pipe(catchError(this.handleError));
  }

  /**
   * Récupère les documents urgents (> 7 jours en attente)
   */
  getDocumentsUrgents(): Observable<Document[]> {
    const url = `${this.API_BASE_URL}/documents/urgents`;

    return this.http.get<Document[]>(url, { headers: this.getHttpHeaders() })
      .pipe(catchError(this.handleError));
  }

  /**
   * Vérifie si un type de fichier est autorisé
   */
  isFileTypeAllowed(fileName: string): boolean {
    const allowedExtensions = [
      '.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png',
      '.gif', '.bmp', '.xls', '.xlsx', '.txt', '.rtf'
    ];

    const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return allowedExtensions.includes(fileExtension);
  }

  /**
   * Vérifie si la taille du fichier est autorisée (max 10MB)
   */
  isFileSizeAllowed(fileSize: number): boolean {
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    return fileSize <= maxSizeInBytes;
  }

  /**
   * Valide un fichier avant upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    if (!this.isFileTypeAllowed(file.name)) {
      return {
        valid: false,
        error: 'Type de fichier non autorisé. Formats acceptés : PDF, DOC, DOCX, JPG, PNG, GIF, BMP, XLS, XLSX, TXT, RTF'
      };
    }

    if (!this.isFileSizeAllowed(file.size)) {
      return {
        valid: false,
        error: 'Fichier trop volumineux. Taille maximale autorisée : 10MB'
      };
    }

    return { valid: true };
  }

  /**
   * Génère un nom de fichier unique
   */
  generateUniqueFileName(originalName: string): string {
    const timestamp = new Date().getTime();
    const extension = originalName.substring(originalName.lastIndexOf('.'));
    const nameWithoutExtension = originalName.substring(0, originalName.lastIndexOf('.'));

    return `${nameWithoutExtension}_${timestamp}${extension}`;
  }

  /**
   * Rafraîchit la liste des documents en attente (si pas déjà présente)
   */
  private refreshDocumentsEnAttente(): void {
    this.getDocumentsEnAttente().subscribe(
      documents => {
        // Les documents sont automatiquement mis à jour via le tap operator
      },
      error => {
        console.error('Erreur lors du rafraîchissement des documents:', error);
      }
    );
  }

  /**
   * Gestion centralisée des erreurs (si pas déjà présente)
   */
  private handleError = (error: any): Observable<never> => {
    let errorMessage = 'Une erreur est survenue';

    if (error?.error instanceof ErrorEvent) {
      errorMessage = `Erreur client: ${error.error.message}`;
    } else if (error?.status) {
      switch (error.status) {
        case 400: errorMessage = 'Requête invalide'; break;
        case 401: errorMessage = 'Non autorisé - Veuillez vous reconnecter'; break;
        case 403: errorMessage = 'Accès interdit'; break;
        case 404: errorMessage = 'Document non trouvé'; break;
        case 413: errorMessage = 'Fichier trop volumineux'; break;
        case 415: errorMessage = 'Type de fichier non supporté'; break;
        case 500: errorMessage = 'Erreur serveur interne'; break;
        case 503: errorMessage = 'Service temporairement indisponible'; break;
        default: errorMessage = `Erreur serveur: ${error.status} - ${error.message}`;
      }

      if (error.error && typeof error.error === 'object' && error.error.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('Erreur DocumentService:', error);
    return throwError(() => new Error(errorMessage));
  };
}
