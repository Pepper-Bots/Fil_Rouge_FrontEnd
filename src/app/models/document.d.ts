// app/models/document.d.ts - VERSION MISE À JOUR

import { TypeDocument } from './type-document.enum';
import { StatutDocument } from './statut-document.model';
import { Dossier } from './dossier.model';
import { Stagiaire } from './stagiaire.model';
import { Evenement } from './evenement.model';

// ===== INTERFACE PRINCIPALE DOCUMENT (votre structure existante) =====

export interface Document {
  id: number;
  nomFichier: string;
  type: TypeDocument;
  statut: StatutDocument;

  // Relations existantes
  dossier?: Dossier;      // Optionnel car nullable côté back
  stagiaire: Stagiaire;
  evenement?: Evenement;  // Optionnel car nullable côté back

  // Métadonnées existantes
  commentaire?: string;
  dateDepot?: string;     // ISO string
  urlFichier?: string;

  // ===== NOUVELLES PROPRIÉTÉS POUR VALIDATION =====

  // Informations du fichier (pour validation)
  taille?: number;        // Taille en bytes
  typeFichier?: string;   // MIME type (ex: 'application/pdf')
  nomFichierOriginal?: string; // Nom original du fichier

  // Validation et historique
  dateValidation?: string;
  validePar?: {
    id: number;
    nom: string;
    prenom: string;
    role: string;
  };
  motifRefus?: string;

  // Métadonnées supplémentaires utiles
  version?: number;
  checksum?: string;
  dateModification?: string;
  derniereModificationPar?: string;
}

// ===== INTERFACE EXISTANTE MISE À JOUR =====

export interface DocumentStatutUpdate {
  statut: string;
  commentaire?: string;
}

// ===== NOUVELLES INTERFACES POUR VALIDATION =====

/**
 * Interface pour la validation d'un document par l'admin
 */
export interface ValidationDocument {
  documentId: number;
  statut: 'VALIDÉ' | 'REFUSÉ';
  commentaires?: string;
  validePar: number; // ID de l'administrateur
  dateValidation: string; // ISO date string
}

/**
 * Interface pour les critères de recherche de documents
 */
export interface CriteresRechercheDocument {
  // Filtres principaux
  type?: TypeDocument;
  statutNom?: string; // Nom du statut (ex: 'EN_ATTENTE')
  stagiaireId?: number;
  dossierId?: number;

  // Filtres par date
  dateDepotDebut?: string;
  dateDepotFin?: string;
  dateValidationDebut?: string;
  dateValidationFin?: string;

  // Filtres textuels
  nomFichier?: string;
  commentaire?: string;

  // Filtres spéciaux
  documentsUrgents?: boolean; // > 7 jours
  documentsRecents?: boolean; // < 24h

  // Pagination
  page?: number;
  taille?: number;

  // Tri
  triPar?: 'dateDepot' | 'dateValidation' | 'nomFichier' | 'type' | 'statut';
  ordreDecroissant?: boolean;
}

/**
 * Interface pour les réponses paginées
 */
export interface PageDocument {
  documents: Document[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Interface pour les statistiques de documents
 */
export interface StatistiquesDocument {
  // Compteurs généraux
  totalDocuments: number;
  documentsEnAttente: number;
  documentsValides: number;
  documentsRefuses: number;

  // Compteurs par période
  documentsAujourdhui: number;
  documentsCetteSemaine: number;
  documentsCeMois: number;

  // Répartition par type
  repartitionParType: { [type: string]: number };

  // Statistiques de validation
  tempsValidationMoyen: number; // en heures
  tauxValidation: number; // pourcentage

  // Documents urgents
  documentsUrgents: number;
  documentsProchesEcheance: number;
}

/**
 * Interface pour l'historique des modifications d'un document
 */
export interface HistoriqueDocument {
  id: number;
  documentId: number;
  action: 'CREATION' | 'MODIFICATION' | 'VALIDATION' | 'REFUS' | 'SUPPRESSION';
  ancienneValeur?: any;
  nouvelleValeur?: any;
  commentaire?: string;
  utilisateurId: number;
  utilisateurNom: string;
  dateAction: string;
}

/**
 * Interface pour les notifications liées aux documents
 */
export interface NotificationDocument {
  id: number;
  type: 'NOUVEAU_DOCUMENT' | 'DOCUMENT_VALIDE' | 'DOCUMENT_REFUSE' | 'DOCUMENT_EXPIRE';
  documentId: number;
  destinataireId: number;
  destinataireType: 'STAGIAIRE' | 'ADMIN' | 'FORMATEUR';
  message: string;
  dateCreation: string;
  estLue: boolean;
  dateLecture?: string;
}

/**
 * Interface FormationInfo adaptée à votre structure existante
 * (en complément de celle dans dashboard-stagiaire.component.ts)
 */
export interface FormationInfoDocument {
  id: number;
  nom: string;
  description?: string;
  dateDebut: string;
  dateFin: string;
  statut: 'EN_COURS' | 'EN_ATTENTE' | 'TERMINEE' | 'SUSPENDUE';

  // Spécifique aux documents
  documentsRequis?: TypeDocument[];
  nombreDocumentsRequis?: number;
  nombreDocumentsUploades?: number;
}

/**
 * Type union pour les statuts possibles lors de l'upload
 */
export type StatutUpload = 'EN_COURS' | 'SUCCES' | 'ECHEC' | 'ANNULE';

/**
 * Interface pour le suivi d'upload
 */
export interface ProgressionUpload {
  documentId?: number;
  nomFichier: string;
  pourcentage: number;
  statut: StatutUpload;
  messageErreur?: string;
  vitesse?: number; // en KB/s
  tempsRestant?: number; // en secondes
}

/**
 * Interface pour la configuration des documents
 */
export interface ConfigurationDocument {
  // Tailles de fichiers
  tailleFichierMaximale: number; // en bytes

  // Types de fichiers autorisés
  typesAutorises: string[];

  // Délais
  delaiValidationJours: number;
  delaiRappelJours: number;

  // Paramètres de stockage
  cheminStockage: string;
  conservationArchiveJours: number;

  // Paramètres de notification
  notificationsActivees: boolean;
  frequenceRappels: number; // en heures
}

/**
 * Classe utilitaire pour la gestion des documents
 * Compatible avec votre modèle existant
 */
export class DocumentUtils {

  /**
   * Vérifie si un document est urgent (> 7 jours en attente)
   */
  static estUrgent(document: Document): boolean {
    if (!document.dateDepot) return false;
    const joursEnAttente = DocumentUtils.calculerJoursEnAttente(document);
    return joursEnAttente > 7;
  }

  /**
   * Calcule le nombre de jours depuis le dépôt
   */
  static calculerJoursEnAttente(document: Document): number {
    if (!document.dateDepot) return 0;
    const dateDepot = new Date(document.dateDepot);
    const maintenant = new Date();
    const diffTime = maintenant.getTime() - dateDepot.getTime();
    return Math.floor(diffTime / (1000 * 3600 * 24));
  }

  /**
   * Retourne la priorité d'un document
   */
  static obtenirPriorite(document: Document): 'NORMALE' | 'IMPORTANTE' | 'URGENTE' {
    const jours = DocumentUtils.calculerJoursEnAttente(document);

    if (jours > 7) return 'URGENTE';
    if (jours > 3) return 'IMPORTANTE';
    return 'NORMALE';
  }

  /**
   * Formate la taille d'un fichier
   */
  static formaterTaille(bytes: number): string {
    if (bytes === 0) return '0 o';

    const k = 1024;
    const sizes = ['o', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Vérifie si un type de fichier est une image
   */
  static estImage(typeFichier?: string): boolean {
    return typeFichier?.startsWith('image/') || false;
  }

  /**
   * Vérifie si un type de fichier est un PDF
   */
  static estPDF(typeFichier?: string): boolean {
    return typeFichier === 'application/pdf';
  }

  /**
   * Retourne l'icône Material appropriée pour un type de fichier
   */
  static obtenirIcone(typeFichier?: string): string {
    if (!typeFichier) return 'insert_drive_file';

    if (DocumentUtils.estPDF(typeFichier)) return 'picture_as_pdf';
    if (DocumentUtils.estImage(typeFichier)) return 'image';
    if (typeFichier.includes('word') || typeFichier.includes('document')) return 'description';
    if (typeFichier.includes('excel') || typeFichier.includes('sheet')) return 'table_chart';
    return 'insert_drive_file';
  }

  /**
   * Vérifie si un document est validé
   */
  static estValide(document: Document): boolean {
    return document.statut?.nom === 'VALIDE' || document.statut?.nom === 'VALIDÉ';
  }

  /**
   * Vérifie si un document est en attente
   */
  static estEnAttente(document: Document): boolean {
    return document.statut?.nom === 'EN_ATTENTE';
  }

  /**
   * Vérifie si un document est refusé
   */
  static estRefuse(document: Document): boolean {
    return document.statut?.nom === 'REFUSE' || document.statut?.nom === 'REFUSÉ';
  }

  /**
   * Formate une date pour l'affichage
   */
  static formaterDate(dateStr?: string): string {
    if (!dateStr) return 'Non renseigné';

    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Retourne la couleur CSS pour le statut
   */
  static getCouleurStatut(statut: StatutDocument): string {
    switch (statut.nom?.toUpperCase()) {
      case 'VALIDE':
      case 'VALIDÉ':
        return 'success';
      case 'EN_ATTENTE':
        return 'warning';
      case 'REFUSE':
      case 'REFUSÉ':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  /**
   * Retourne l'icône pour le statut
   */
  static getIconeStatut(statut: StatutDocument): string {
    switch (statut.nom?.toUpperCase()) {
      case 'VALIDE':
      case 'VALIDÉ':
        return 'check_circle';
      case 'EN_ATTENTE':
        return 'hourglass_empty';
      case 'REFUSE':
      case 'REFUSÉ':
        return 'cancel';
      default:
        return 'help';
    }
  }
}// ===== INTERFACES ET MODÈLES POUR LES DOCUMENTS =====

/**
 * Énumération des types de documents autorisés
 */
export enum TypeDocument {
  CV = 'CV',
  DIPLOME = 'DIPLOME',
  ATTESTATION = 'ATTESTATION',
  CERTIFICAT = 'CERTIFICAT',
  PHOTO_IDENTITE = 'PHOTO_IDENTITE',
  PIECE_IDENTITE = 'PIECE_IDENTITE',
  JUSTIFICATIF_DOMICILE = 'JUSTIFICATIF_DOMICILE',
  LETTRE_MOTIVATION = 'LETTRE_MOTIVATION',
  REFERENCES = 'REFERENCES',
  PORTFOLIO = 'PORTFOLIO',
  AUTRE = 'AUTRE'
}

/**
 * Énumération des statuts de document
 */
export enum StatutDocument {
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDE = 'VALIDE',
  REFUSE = 'REFUSE',
  EN_COURS = 'EN_COURS',
  ARCHIVE = 'ARCHIVE'
}

/**
 * Interface pour les informations de stagiaire (version simplifiée)
 */
export interface StagiaireInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  telephone?: string;
  dateNaissance?: string;
}

/**
 * Interface pour les informations de formation
 */
export interface FormationInfo {
  id: string;
  nom: string;
  code: string;
  dateDebut: string;
  dateFin: string;
  organisme: string;
}

/**
 * Interface principale pour un Document
 */
export interface Document {
  // Identifiants
  id: string;

  // Informations du fichier
  nomFichier: string;
  nomFichierOriginal?: string;
  taille: number;
  typeFichier: string; // MIME type (ex: 'application/pdf')
  cheminFichier?: string;

  // Métadonnées du document
  type: TypeDocument | string;
  statut: StatutDocument | string;
  description?: string;

  // Dates
  dateDepot: string; // ISO date string
  dateValidation?: string;
  dateModification?: string;

  // Relations
  stagiaire: StagiaireInfo;
  formation?: FormationInfo;

  // Validation
  validePar?: {
    id: string;
    nom: string;
    prenom: string;
    role: string;
  };
  commentairesValidation?: string;
  motifRefus?: string;

  // Métadonnées additionnelles
  version?: number;
  checksum?: string;
  estObligatoire?: boolean;
  dateEcheance?: string;

  // Propriétés calculées (optionnelles)
  joursEnAttente?: number;
  priorite?: 'NORMALE' | 'IMPORTANTE' | 'URGENTE';

  // Audit
  dateCreation?: string;
  creePar?: string;
  derniereModificationPar?: string;
}

/**
 * Interface pour la création d'un nouveau document
 */
export interface NouveauDocument {
  // Fichier (géré par FormData)
  fichier: File;

  // Informations obligatoires
  type: TypeDocument;
  stagiaireId: string;
  formationId?: string;

  // Informations optionnelles
  description?: string;
  estObligatoire?: boolean;
  dateEcheance?: string;
}

/**
 * Interface pour la validation d'un document
 */
export interface ValidationDocument {
  documentId: string;
  statut: 'VALIDE' | 'REFUSE';
  commentaires?: string;
  validePar: string; // ID de l'administrateur
  dateValidation: string; // ISO date string
}

/**
 * Interface pour les critères de recherche de documents
 */
export interface CriteresRechercheDocument {
  // Filtres principaux
  type?: TypeDocument;
  statut?: StatutDocument;
  stagiaireId?: string;
  formationId?: string;

  // Filtres par date
  dateDepotDebut?: string;
  dateDepotFin?: string;
  dateValidationDebut?: string;
  dateValidationFin?: string;

  // Filtres textuels
  nomFichier?: string;
  description?: string;

  // Filtres spéciaux
  documentsUrgents?: boolean; // > 7 jours
  documentsObligatoires?: boolean;

  // Pagination
  page?: number;
  taille?: number;

  // Tri
  triPar?: 'dateDepot' | 'dateValidation' | 'nomFichier' | 'type' | 'statut';
  ordreDecroissant?: boolean;
}

/**
 * Interface pour les réponses paginées
 */
export interface PageDocument {
  documents: Document[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Interface pour les statistiques de documents
 */
export interface StatistiquesDocument {
  // Compteurs généraux
  totalDocuments: number;
  documentsEnAttente: number;
  documentsValides: number;
  documentsRefuses: number;

  // Compteurs par période
  documentsAujourdhui: number;
  documentsCetteSemaine: number;
  documentsCeMois: number;

  // Répartition par type
  repartitionParType: { [type: string]: number };

  // Statistiques de validation
  tempsValidationMoyen: number; // en heures
  tauxValidation: number; // pourcentage

  // Documents urgents
  documentsUrgents: number;
  documentsProchesEcheance: number;
}

/**
 * Interface pour l'historique des modifications d'un document
 */
export interface HistoriqueDocument {
  id: string;
  documentId: string;
  action: 'CREATION' | 'MODIFICATION' | 'VALIDATION' | 'REFUS' | 'SUPPRESSION';
  ancienneValeur?: any;
  nouvelleValeur?: any;
  commentaire?: string;
  utilisateurId: string;
  utilisateurNom: string;
  dateAction: string;
}

/**
 * Interface pour les notifications liées aux documents
 */
export interface NotificationDocument {
  id: string;
  type: 'NOUVEAU_DOCUMENT' | 'DOCUMENT_VALIDE' | 'DOCUMENT_REFUSE' | 'DOCUMENT_EXPIRE';
  documentId: string;
  destinataireId: string;
  destinataireType: 'STAGIAIRE' | 'ADMIN' | 'FORMATEUR';
  message: string;
  dateCreation: string;
  estLue: boolean;
  datelecture?: string;
}

/**
 * Interface pour les paramètres de configuration des documents
 */
export interface ConfigurationDocument {
  // Tailles de fichiers
  tailleFichierMaximale: number; // en bytes

  // Types de fichiers autorisés
  typesAutorises: string[];

  // Délais
  delaiValidationJours: number;
  delaiRappelJours: number;

  // Paramètres de stockage
  cheminStockage: string;
  conservationArchiveJours: number;

  // Paramètres de notification
  notificationsActivees: boolean;
  frequenceRappels: number; // en heures
}

/**
 * Type union pour les statuts possibles lors de l'upload
 */
export type StatutUpload = 'EN_COURS' | 'SUCCES' | 'ECHEC' | 'ANNULE';

/**
 * Interface pour le suivi d'upload
 */
export interface ProgressionUpload {
  documentId?: string;
  nomFichier: string;
  pourcentage: number;
  statut: StatutUpload;
  messageErreur?: string;
  vitesse?: number; // en KB/s
  tempsRestant?: number; // en secondes
}

/**
 * Classe utilitaire pour la gestion des documents
 */
export class DocumentUtils {

  /**
   * Vérifie si un document est urgent (> 7 jours en attente)
   */
  static estUrgent(document: Document): boolean {
    const joursEnAttente = DocumentUtils.calculerJoursEnAttente(document);
    return joursEnAttente > 7;
  }

  /**
   * Calcule le nombre de jours depuis le dépôt
   */
  static calculerJoursEnAttente(document: Document): number {
    const dateDepot = new Date(document.dateDepot);
    const maintenant = new Date();
    const diffTime = maintenant.getTime() - dateDepot.getTime();
    return Math.floor(diffTime / (1000 * 3600 * 24));
  }

  /**
   * Retourne la priorité d'un document
   */
  static obtenirPriorite(document: Document): 'NORMALE' | 'IMPORTANTE' | 'URGENTE' {
    const jours = DocumentUtils.calculerJoursEnAttente(document);

    if (jours > 7) return 'URGENTE';
    if (jours > 3) return 'IMPORTANTE';
    return 'NORMALE';
  }

  /**
   * Formate la taille d'un fichier
   */
  static formaterTaille(bytes: number): string {
    if (bytes === 0) return '0 o';

    const k = 1024;
    const sizes = ['o', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Vérifie si un type de fichier est une image
   */
  static estImage(typeFichier: string): boolean {
    return typeFichier.startsWith('image/');
  }

  /**
   * Vérifie si un type de fichier est un PDF
   */
  static estPDF(typeFichier: string): boolean {
    return typeFichier === 'application/pdf';
  }

  /**
   * Retourne l'icône Material appropriée pour un type de fichier
   */
  static obtenirIcone(typeFichier: string): string {
    if (DocumentUtils.estPDF(typeFichier)) return 'picture_as_pdf';
    if (DocumentUtils.estImage(typeFichier)) return 'image';
    if (typeFichier.includes('word') || typeFichier.includes('document')) return 'description';
    if (typeFichier.includes('excel') || typeFichier.includes('sheet')) return 'table_chart';
    return 'insert_drive_file';
  }
}
