import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {jwtDecode} from 'jwt-decode';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {environment} from '../../environments/environment';

// Import des modèles existants
import { Ville } from '../models/ville';
import {NiveauDroit} from '../models/niveau-droit.enum';
import {TypeAdmin} from '../models/type-admin.enum';
import {Stagiaire} from '../models/stagiaire';
import {Admin} from '../models/admin';
import {User} from '../models/user';

interface JwtPayload {
  id: number;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN' | 'STAGIAIRE';
  lastName: string;
  firstName: string;
  premiereConnexion: boolean;
  exp: number;

  // Propriétés spécifiques aux stagiaires
  adresse?: string;
  phone?: string;
  dateNaissance?: string;

  // Propriétés spécifiques aux admins
  departement?: string;
  typeAdmin?: string;
  niveauDroit?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private tokenKey = 'jwt';
  private apiUrl = environment.serverUrl + 'api/auth';
  private premiereConnexionSubject = new BehaviorSubject<boolean>(false);

  connecte = false;
  role: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const jwt = localStorage.getItem(this.tokenKey);
    if (jwt) {
      this.decodeJwt(jwt);
    }
  }

  login(email: string, password: string): Observable<any> {
    console.log('mockAuth activé ?', (environment as any).mockAuth);

    // Si mockAuth est activé dans l'environnement
    if ((environment as any).mockAuth) {
      console.log('🔥 MOCK ACTIVÉ - Pas d\'appel HTTP');
      return this.mockLogin(email, password);
    }

    console.log('🌐 APPEL BACKEND RÉEL');
    // Sinon, appel réel du back
    return this.http.post(`${this.apiUrl}/connexion`, {email, password}).pipe(
      tap((response: any) => {
        if (response.token) {
          this.decodeJwt(response.token);
        }
      })
    );
  }

  /**
   * Décode le JWT, stocke le token, et extrait les infos utiles
   */
  decodeJwt(jwt: string) {
    localStorage.setItem(this.tokenKey, jwt);
    try {
      const payload = jwtDecode<JwtPayload>(jwt);
      this.role = payload.role;
      localStorage.setItem('role', payload.role);
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
    localStorage.removeItem('role');
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
      const now = Math.floor(Date.now() / 1000);
      const result = payload.exp && payload.exp > now;
      return <boolean>result;
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
   * Observable première connexion
   */
  premiereConnexion$: Observable<boolean> = this.premiereConnexionSubject.asObservable();

  /**
   * Récupère les informations de l'utilisateur depuis le JWT
   */
  getUser(): User | Admin | Stagiaire | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = jwtDecode<JwtPayload>(token);

      // Objet User de base selon votre modèle
      const baseUser: User = {
        id: payload.id,
        enabled: true, // ou depuis le payload si disponible
        lastName: payload.lastName,
        firstName: payload.firstName,
        email: payload.email,
        nomRole: payload.role
      };

      // Retour typé selon le rôle
      switch (payload.role) {
        case 'ADMIN':
        case 'SUPER_ADMIN':
          return {
            ...baseUser,
            typeAdmin: TypeAdmin.RESPONSABLE_ETABLISSEMENT, // Valeur par défaut ou depuis payload
            niveauDroit: payload.role === 'SUPER_ADMIN' ? NiveauDroit.SUPER_ADMIN : NiveauDroit.ADMIN
          } as Admin;

        case 'STAGIAIRE':
          return {
            ...baseUser,
            premiereConnexion: payload.premiereConnexion,
            dateNaissance: payload.dateNaissance || '',
            phoneNumber: payload.phone || '',
            adresse: payload.adresse || '',
            ville: {} as Ville // Objet vide ou depuis une autre source
          } as Stagiaire;

        default:
          console.warn('Rôle utilisateur non reconnu:', payload.role);
          return baseUser;
      }

    } catch (error) {
      console.error('Erreur lors de la récupération des infos utilisateur:', error);
      return null;
    }
  }

  /**
   * Vérifie si l'utilisateur connecté est un Admin
   */
  isAdmin(): boolean {
    const role = this.getRole();
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  }

  /**
   * Vérifie si l'utilisateur connecté est un Super Admin
   */
  isSuperAdmin(): boolean {
    const role = this.getRole();
    return role === 'SUPER_ADMIN';
  }

  /**
   * Vérifie si l'utilisateur connecté est un Stagiaire
   */
  isStagiaire(): boolean {
    const role = this.getRole();
    return role === 'STAGIAIRE';
  }

  /**
   * Récupère l'ID de l'utilisateur connecté
   */
  getUserId(): number | null {
    const user = this.getUser();
    return user && 'id' in user ? user.id : null;
  }

  /**
   * Récupère l'email de l'utilisateur connecté
   */
  getUserEmail(): string | null {
    const user = this.getUser();
    return user && 'email' in user ? user.email : null;
  }

  /**
   * Mock login pour développement
   */
  private mockLogin(email: string, password: string): Observable<any> {
    // Gardez votre logique actuelle qui fonctionne
    const mockPayload = {
      id: 1,
      email: email,
      role: 'ADMIN', // ou changez selon vos tests
      lastName: 'Test',
      firstName: 'Utilisateur',
      premiereConnexion: false,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
      adresse: '123 Rue Test',
      phone: '0123456789',
      dateNaissance: '1990-01-01',
      departement: 'IT',
      permissions: ['READ', 'WRITE']
    };

    // Création d'un faux JWT
    const header = btoa(JSON.stringify({ typ: 'JWT', alg: 'HS256' }));
    const payload = btoa(JSON.stringify(mockPayload));
    const mockJWT = `${header}.${payload}.fake-signature`;

    // Simulation d'une réponse
    return new Observable(observer => {
      setTimeout(() => {
        this.decodeJwt(mockJWT);
        observer.next({
          token: mockJWT,
          success: true
        });
        observer.complete();
      }, 1000);
    });
  }
}
