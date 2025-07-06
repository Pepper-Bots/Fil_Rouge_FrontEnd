// models/evenement.model.ts
export interface Evenement {
  id?: number;
  stagiaireId: number; // (en front tu utilises les ids pour poster)
  type: 'ABSENCE' | 'RETARD';
  date: string; // format ISO, peut-être dateDebut si besoin de matcher strictement
  motif: string; // ou motifId si back attend l'id !
  description?: string;
  statut?: 'EN_ATTENTE' | 'JUSTIFIE' | 'INJUSTIFIE';
  documentId?: number;
  dateDeclaration?: string;
  dateTraitement?: string;
  adminId?: number;
}
