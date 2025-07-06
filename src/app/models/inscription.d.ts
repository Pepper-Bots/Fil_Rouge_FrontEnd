// models/inscription.model.ts

import { StatutInscription } from './statut-inscription.enum';
import { Stagiaire } from './stagiaire.model';
import { Formation } from './formation.model';
import { Dossier } from './dossier.model';

export interface Inscription {
  id: number;
  dateInscription: string;
  dateModification?: string;
  dateValidation?: string;
  statut: StatutInscription;
  stagiaire: Stagiaire;
  formation: Formation;
  dossier?: Dossier;
}
