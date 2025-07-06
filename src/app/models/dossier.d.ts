// models/dossier.model.ts

import { StatutDossier } from './statut-dossier';
import { Document } from './document.model';
import { Stagiaire } from './stagiaire.model';
import { Formation } from './formation.model';
import { Admin } from './admin.model';

export interface Dossier {
  id: number;
  codeDossier: string;
  statutDossier: StatutDossier;

  documents?: Document[]; // Optionnel: peut ne pas être chargé selon les vues

  dateCreation: string; // ISO string (LocalDateTime côté back)
  derniereMiseAJour?: string;
  dateModification?: string;

  stagiaire: Stagiaire;
  formation: Formation;
  createur: Admin;

  // Champs calculés ou exposés via @JsonView
  nomPrenomStagiaire?: string;
  titreFormation?: string;
  nomCreateur?: string;
  nomImage?: string;
}
