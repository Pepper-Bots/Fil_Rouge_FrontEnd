export interface DocumentEvenement {
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
