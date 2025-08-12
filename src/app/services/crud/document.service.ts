// src/app/services/crud/document.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {TypeDocument} from '../../models/type-document.enum';
import { Document } from '../../models/document';

export interface DocumentValidation {
  Statut: string; // 'VALIDÉ' | 'REFUSÉ'
  Commentaire?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  constructor(private http: HttpClient) {}

  /**
   * Upload d'un document (votre méthode existante + améliorations)
   */
  uploadDocument(type: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', file);

    return this.http.post('/api/documents', formData);
  }

  /**
   * Upload pour un dossier spécifique
   */
  uploadDocumentForDossier(dossierId: number, file:File, type: TypeDocument): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.http.post(`/api/documents/dossier/${dossierId}/upload`, formData);
  }

  /**
   * Documents en attente de validation (admin)
   */
  getDocumentsEnAttente(): Observable<Document[]> {
    return this.http.get<Document[]>(`/api/documents/en-attente`);
  }

  /**
   * Validation d'un document (admin)
   */
  validerDocument(documentId: number, validation: DocumentValidation): Observable<any> {
    return this.http.put(`/api/documents/valider/${documentId}`, validation);
  }

  /**
   * Suppression d'un document
   */
  deleteDocument(documentId: number): Observable<any> {
    return this.http.delete(`/api/documents/${documentId}`);
  }

  /**
   * Téléchargement d'un document
   */
  downloadDocument(documentId: number): Observable<Blob> { // todo Blob ?
    return this.http.get(`/api/documents/download/${documentId}`, {
      responseType: 'blob'
    });
  }

  /**
   * Formations d'un stagiaire
   */
  getFormationByStagiaire(stagiaireId: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/formation/stagiaire/${stagiaireId}/formations`);
  }

  /**
   * Utilitaires pour l'UI
   */
  getTypeDisplayName(type: TypeDocument): string {
    const displayNames: { [key in TypeDocument]: string } = {
      [TypeDocument.PIECE_IDENTITE]: 'Pièce d\'identité',
      [TypeDocument.DIPLOME_BAC]: 'Diplôme BAC',
      [TypeDocument.DIPLOME_BAC_2]: 'Diplôme BAC+2',
      [TypeDocument.DIPLOME_BAC_3]: 'Diplôme BAC+3',
      [TypeDocument.CV]: 'CV',
      [TypeDocument.LETTRE_MOTIVATION]: 'Lettre de motivation',
      [TypeDocument.JUSTIF_SITUATION]: 'Justificatif de situation',
      [TypeDocument.JUSTIFICATIF]: 'Justificatif',
      [TypeDocument.PORTFOLIO]: 'Portfolio',
      [TypeDocument.ATTEST_RESP_CIVILE]: 'Attestation responsabilité civile',
      [TypeDocument.AUTRE]: 'Autre'
    };
    return displayNames[type] || type;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'VALIDÉ': return 'text-green-600';
      case 'EN_ATTENTE': return 'text-yellow-600';
      case 'REFUSÉ': return 'text-red-600';
      case 'MANQUANT': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'VALIDÉ': return 'check_circle';
      case 'EN_ATTENTE': return 'schedule';
      case 'REFUSÉ': return 'cancel';
      case 'MANQUANT': return 'error_outline';
      default: return 'help_outline';
    }
  }
}
