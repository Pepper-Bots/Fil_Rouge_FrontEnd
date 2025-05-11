// dossier.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dossier } from '../models/dossier.model';

@Injectable({
  providedIn: 'root'
})
export class DossierService {
  private apiUrl = 'http://localhost:8080/api/dossiers';

  constructor(private http: HttpClient) {}

  getAllDossiers(): Observable<Dossier[]> {
    return this.http.get<Dossier[]>(this.apiUrl);
  }

  getDossierById(id: number): Observable<Dossier> {
    return this.http.get<Dossier>(`${this.apiUrl}/${id}`);
  }

  createDossier(dossier: Dossier): Observable<Dossier> {
    return this.http.post<Dossier>(this.apiUrl, dossier);
  }

  // etc...
}
