import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface AuthResponse {
  token: string;
  premiereConnexion?: boolean;
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080'; // adapte selon ton env
  private tokenKey = 'jwt_token';
  private premiereConnexionSubject = new BehaviorSubject<boolean>(false);

  http = inject(HttpClient);
  router = inject(Router);

  premiereConnexion$ = this.premiereConnexionSubject.asObservable();

  /** Connexion utilisateur */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/connexion`, { email, password }).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          // Gère le flag première connexion (pour le popup)
          if (response.premiereConnexion) {
            this.premiereConnexionSubject.next(true);
          } else {
            this.premiereConnexionSubject.next(false);
          }
        }
      })
    );
  }

  /** Changement du mot de passe à la première connexion */
  changePassword(email: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, { email, newPassword }).pipe(
      tap(() => {
        // Une fois changé, le flag saute
        this.premiereConnexionSubject.next(false);
      })
    );
  }

  /** Déconnexion */
  logout() {
    localStorage.removeItem(this.tokenKey);
    this.premiereConnexionSubject.next(false);
    this.router.navigate(['/connexion']);
  }

  /** Retourne le JWT */
  getToken(): string| null {
    return localStorage.getItem(this.tokenKey);
  }

  /** Utilitaire pour savoir si l'utilisateur est connecté */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /** Retourne le rôle à partir du JWT, ou null si pas connecté */
  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    // Un JWT est de la forme "header.body.signature"
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
      // on décode la partie 'body'
      const payload = JSON.parse(atob(parts[1]));
      return payload.role || null;
    } catch {
      return null;
    }
  }

}

//  service métier pour la logique d’authentification, gestion du token, login, logout, etc
