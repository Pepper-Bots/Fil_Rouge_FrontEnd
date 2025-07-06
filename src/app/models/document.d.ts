// models/document.model.ts

import { TypeDocument } from './type-document.enum';
import { StatutDocument } from './statut-document.model';
import { Dossier } from './dossier.model';
import { Stagiaire } from './stagiaire.model';
import { Evenement } from './evenement.model';

export interface Document {
  id: number;
  nomFichier: string;
  type: TypeDocument;

  statut: StatutDocument;
  dossier?: Dossier;      // Optionnel car nullable côté back
  stagiaire: Stagiaire;
  evenement?: Evenement;  // Optionnel car nullable côté back

  commentaire?: string;
  dateDepot?: string;     // ISO string
  urlFichier?: string;
}
