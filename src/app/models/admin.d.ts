// models/admin.model.ts

import { User } from './user.model';

declare enum TypeAdmin {
  RESPONSABLE_ETABLISSEMENT = "RESPONSABLE_ETABLISSEMENT",
  RESPONSABLE_FORMATION = "RESPONSABLE_FORMATION",
  ASSISTANT_VIE_SCOLAIRE = "ASSISTANT_VIE_SCOLAIRE",
  ASSISTANT_ADMINISTRATIF = "ASSISTANT_ADMINISTRATIF"
}

declare enum NiveauDroit {
  BASIQUE = "BASIQUE",
  MODERATEUR = "MODERATEUR",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN"
}

declare interface Admin extends User {
  typeAdmin: TypeAdmin;
  niveauDroit: NiveauDroit;
}
