// models/stagiaire.ts

import {User} from './user';
import {Ville} from './ville';
import {Evenement} from './evenement';
import {Dossier} from './dossier';
import {Inscription} from './inscription';
import { Document as DocumentModel } from './document';


export interface Stagiaire extends User {
  premiereConnexion: boolean;
  dateNaissance: string; // format ISO yyyy-MM-dd
  phoneNumber: string;
  adresse: string;
  ville: Ville;
  evenements?: Evenement[];
  documents?: DocumentModel[];
  dossiers?: Dossier[];
  inscriptions?: Inscription[];
  activationToken?: string;
  photoProfil?: string;
  statutActuelInscription?: 'INCOMPLET' | 'COMPLET' | 'EN_COURS' | 'VALIDE' | null;
}

