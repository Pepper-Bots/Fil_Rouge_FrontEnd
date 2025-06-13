import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

export interface Evenement {
  id?: number;
  type: string;
  motif: string;
  date: string;
  stagiaireId: number;
  // autres propriétés selon ton backend
}

@Injectable({
  providedIn: 'root'
})
export class EvenementService {

  private apiUrl = 'http://localhost:8080/api/evenements'; // adapte selon ton backend

  constructor(private http: HttpClient) {}

  // Créer une déclaration d'événement
  creerEvenement(evenement: Evenement): Observable<Evenement> {
    return this.http.post<Evenement>(this.apiUrl, evenement);
  }

  // Récupérer la liste des événements d'un stagiaire
  getEvenementsParStagiaire(stagiaireId: number): Observable<Evenement[]> {
    return this.http.get<Evenement[]>(`${this.apiUrl}/stagiaire/${stagiaireId}`);
  }

  // autres méthodes CRUD possibles...
}
