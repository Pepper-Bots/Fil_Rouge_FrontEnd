// models/admin.model.ts

import { User } from './user.model';

export enum TypeAdmin {
  SUPER_ADMIN = "SUPER_ADMIN",
  RH = "RH",
  TECHNIQUE = "TECHNIQUE",
  // Ajoute les autres valeurs selon ton enum
}

export enum NiveauDroit {
  LECTURE = "LECTURE",
  ECRITURE = "ECRITURE",
  COMPLET = "COMPLET",
  // Complète si besoin
}

export interface Admin extends User {
  typeAdmin: TypeAdmin;
  niveauDroit: NiveauDroit;
}
