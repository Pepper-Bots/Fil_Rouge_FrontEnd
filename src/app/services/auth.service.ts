import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {jwtDecode} from 'jwt-decode';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';


interface JwtPayload {
  id: number;
  email: string;
  role: string;
  premiereConnexion: boolean;
  exp: number;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private tokenKey = 'jwt';
  private apiUrl = '/api/auth'; // adapter si besoin
  private premiereConnexionSubject = new BehaviorSubject<boolean>(false);

  connecte = false;
  role: string | null = null;

  constructor(

    private http: HttpClient,
    private router: Router
  ) {
    const jwt = localStorage.getItem(this.tokenKey);
    if (jwt) {
      this.decodeJwt(jwt); // -> pas vraiment 'connexion' mais plutot extraction de données  -> on renomme
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/connexion`, { email, password });
  }

  /**
   * Décode le JWT, stocke le token, et extrait les infos utiles
   */
  decodeJwt(jwt: string) {
    localStorage.setItem(this.tokenKey, jwt);
    try {
      const payload = jwtDecode<JwtPayload>(jwt);
      this.role = payload.role;
      this.connecte = true;
      this.premiereConnexionSubject.next(payload.premiereConnexion);
    } catch (e) {
      console.error('Erreur de décodage JWT', e);
      this.logout();
    }
  }

  /**
   * Déconnexion manuelle
   */
  logout() {
    localStorage.removeItem(this.tokenKey);
    this.connecte = false;
    this.role = null;
    this.premiereConnexionSubject.next(false);
    this.router.navigate(['/connexion']);
  }

  /**
   * Envoie le changement de mot de passe
   */
  changePassword(email: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, { email, newPassword }).pipe(
      tap(() => {
        // Une fois changé, le flag saute
        this.premiereConnexionSubject.next(false);
      })
    );
  }

  /**
   * Utilitaire : est-ce qu'un JWT valide est présent ?
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = jwtDecode<JwtPayload>(token);
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  /**
   * Récupère le token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Accès au rôle (utile pour afficher des éléments conditionnellement)
   */
  getRole(): string | null {
    return this.role;
  }


  /**
   * Est-ce une première connexion ?
   */
  get premiereConnexion(): boolean {
    return this.premiereConnexionSubject.getValue();
  }

  /**
   * Permet aux guards ou aux composants de souscrire à premièreConnexion
   */
  premiereConnexion$: Observable<boolean> = this.premiereConnexionSubject.asObservable();
}

//  service métier pour la logique d’authentification, gestion du token, login, logout, etc
// AuthService sera injecté dans connection et dans app pour les faire communiquer
