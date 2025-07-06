// models/liste-documents-obligatoires.model.ts

import { Formation } from './formation.model';
import { TypeDocument } from './type-document.enum';

export interface ListeDocumentsObligatoires {
  id: number;
  formation: Formation;
  typeDocument: TypeDocument;
}
