export interface Evenement {
  id?: number;
  stagiaireId: number;
  type: 'ABSENCE' | 'RETARD';
  dateEvenement: string;
  motif: string;
  description?: string;
  statut: 'EN_ATTENTE' | 'JUSTIFIE' | 'INJUSTIFIE';
  documentId?: number;
  dateDeclaration: string;
  dateTraitement?: string;
  adminId?: number;
}

export interface Document {
  id?: number;
  nom: string;
  type: string;
  taille: number;
  url?: string;
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REJETE';
  dateUpload: string;
  dateValidation?: string;
  adminId?: number;
  commentaire?: string;
}

export interface MotifAbsence {
  code: string;
  libelle: string;
  justificationRequise: boolean;
}
