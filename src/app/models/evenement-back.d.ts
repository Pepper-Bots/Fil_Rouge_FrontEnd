// models/evenement-back.model.ts
import { Stagiaire } from './stagiaire.model';
import { Motif } from './motif.model';
import { Document } from './document.model';

export interface EvenementBack {
  id: number;
  dateDebut: string;  // yyyy-MM-dd
  dateFin?: string;
  estRetard: boolean;
  stagiaire: Stagiaire;
  motif: Motif;
  document?: Document;
}
