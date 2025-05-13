// models/dossier.model.ts
export interface Dossier {
  id: number;
  codeDossier: string;
  dateCreation: string;
  lastUpdated?: string;

  // Références aux objets liés
  statutDossier: {
    id: number;
    nom: string;
    couleur: string;
    description?: string;
  };

  // Informations dérivées via JsonView
  nomPrenomStagiaire?: string;
  titreFormation?: string;
  nomCreateur?: string;
}

export interface StatutDocument {
  id: number;
  nom: string;
  description?: string;
}

export interface Document {
  id: number;
  nom: string;
  fileUrl: string;
  dateUpload: string;
  statut: string;
  type: string;
}
