// Création de l'interface (avec type ou interface → interface pour des héritages)
type Dossier = {
  id: number;
  nom: string;
  codeDossier: string;
  document: Document[];
  statutDocument: StatutDocument;
  statutDossier: StatutDossier;
  lastUpdated: LocalDateTime;
  stagiaire: Stagiaire;
  formation: Formation;
}
