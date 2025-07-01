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




