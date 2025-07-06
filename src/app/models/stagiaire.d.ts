// models/stagiaire.model.ts

import {User} from './user';
import { Ville } from './ville.model';
import { Evenement } from './evenement.model';
import { Document } from './document.model';
import { Dossier } from './dossier.model';
import { Inscription } from './inscription.model';

export interface Stagiaire extends User {
  premiereConnexion: boolean;
  dateNaissance: string; // format ISO yyyy-MM-dd
  phoneNumber: string;
  adresse: string;
  ville: Ville;
  evenements?: Evenement[];
  documents?: Document[];
  dossiers?: Dossier[];
  inscriptions?: Inscription[];
  activationToken?: string;
  photoProfil?: string;
  statutActuelInscription?: string; // ou StatutInscription (enum) si exposé côté back
}
