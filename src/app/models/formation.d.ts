// models/formation.model.ts

import { NiveauFormation } from './niveau-formation.enum';
import { Inscription } from './inscription.model';
import { Dossier } from './dossier.model';
import { ListeDocumentsObligatoires } from './liste-documents-obligatoires.model';

export interface Formation {
  id: number;
  nom: string;
  niveau?: NiveauFormation;
  description?: string;
  dateDebut?: string;
  dateFin?: string;
  inscriptions?: Inscription[];
  dossiers?: Dossier[];
  listeDocumentsObligatoires?: ListeDocumentsObligatoires[];
  titre?: string; // si calculé côté back
  // listeDocumentsObligatoiresSimple?: TypeDocument[]; // si renvoyé par un getter/JsonView
}
