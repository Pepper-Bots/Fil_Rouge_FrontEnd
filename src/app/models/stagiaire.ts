// models/stagiaire.ts

import {User} from './user';
import {Ville} from './ville';
import {Evenement} from './evenement';
import {Dossier} from './dossier';
import {Inscription} from './inscription';


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

