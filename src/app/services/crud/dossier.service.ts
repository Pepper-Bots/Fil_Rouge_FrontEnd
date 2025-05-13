// dossier.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Dossier } from '../models/dossier.model';

@Injectable({
  providedIn: 'root'
})
export class DossierService {
  private apiUrl = `${environment.apiUrl}/dossiers`;

  constructor(private http: HttpClient) {}

  // Récupérer tous les dossiers
  getAllDossiers(): Observable<Dossier[]> {
    return this.http.get<Dossier[]>(this.apiUrl);
  }

  // Récupérer les dossiers avec pagination
  getDossiersPaginated(page: number, size: number): Observable<{ content: Dossier[], totalElements: number, totalPages: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<{ content: Dossier[], totalElements: number, totalPages: number }>(`${this.apiUrl}/paginated`, { params });
  }

  // Récupérer un dossier par son ID
  getDossierById(id: number): Observable<Dossier> {
    return this.http.get<Dossier>(`${this.apiUrl}/${id}`);
  }

  // Créer un nouveau dossier
  createDossier(dossier: Dossier): Observable<Dossier> {
    return this.http.post<Dossier>(this.apiUrl, dossier);
  }

  // Mettre à jour un dossier
  updateDossier(id: number, dossier: Dossier): Observable<Dossier> {
    return this.http.put<Dossier>(`${this.apiUrl}/${id}`, dossier);
  }

  // Supprimer un dossier
  deleteDossier(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
