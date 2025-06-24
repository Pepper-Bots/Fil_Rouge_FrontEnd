import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {jwtDecode} from 'jwt-decode';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {environment} from '../../environments/environment';

// Interfaces correspondant à mon backend Spring Boot
interface BaseUser {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  dateCreation: string;
  premiereConnexion: boolean;
  actif: boolean;
}

interface Admin extends BaseUser {
  role: 'ADMIN' | 'SUPER_ADMIN';
  departement?: string;
  permissions?: string[];
}

interface Stagiaire extends BaseUser {
  role: 'STAGIAIRE';
  dateNaissance?: string;
  telephone?: string;
  adresse?: string;
  niveauEtudes?: string;
  formations?: number[]; // IDs des formations
}

// Union type pour tous les utilisateurs
type User = Admin | Stagiaire;


interface JwtPayload {
  adresse: string;
  phone: string;
  dateNaissance: string;
  departement: string;
  permissions: any[];
  id: number;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN' | 'STAGIAIRE';
  lastName: string;
  firstName: string;
  premiereConnexion: boolean;
  exp: number;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private tokenKey = 'jwt';
  private apiUrl = environment.serverUrl + 'api/auth'; // adapter si besoin
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
    return this.http.post(`${this.apiUrl}/connexion`, {email, password});
  }

  /**
   * Décode le JWT, stocke le token, et extrait les infos utiles
   */
  decodeJwt(jwt: string) {
    localStorage.setItem(this.tokenKey, jwt);
    try {
      const payload = jwtDecode<JwtPayload>(jwt);
      this.role = payload.role; // bien mettre à jour le rôle
      localStorage.setItem('role', payload.role); // Ajoute ça pour forcer la persistance
      this.connecte = true;     // bien mettre à jour connecté
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
    return this.http.post(`${this.apiUrl}/change-password`, {email, newPassword}).pipe(
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
      const payload = jwtDecode<any>(token);
      console.log('Payload JWT dans isAuthenticated:', payload);
      const now = Math.floor(Date.now() / 1000); // ⚠️ met bien en SECONDES
      // Retourne false si exp absent ou passé
      console.log('exp payload:', payload.exp, 'now:', now, 'diff:', payload.exp - now);
      const result = payload.exp && payload.exp > now;
      console.log('Résultat isAuthenticated:', result);
      return result;

    } catch {

      return false;
    }
  }

  /**
   * Récupère le token
   */
  getToken(): string | null {
    // Préfère lire depuis le localStorage pour être sûr à 100%
    // return localStorage.getItem('role');
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

  /**
   * Récupère les informations de l'utilisateur depuis le JWT avec typage fort
   * @returns User | null - Les infos utilisateur typées selon le rôle
   */
  getUser(): User | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = jwtDecode<JwtPayload>(token);

      // Construction de l'objet utilisateur selon le rôle
      const baseUser: BaseUser = {
        id: payload.id,
        email: payload.email,
        nom: payload.lastName,
        prenom: payload.firstName,
        dateCreation: new Date().toISOString(), // ou depuis le payload si disponible
        premiereConnexion: payload.premiereConnexion,
        actif: true // ou depuis le payload si disponible
      };
      // Retour typé selon le rôle
      switch (payload.role) {
        case 'ADMIN':
        case 'SUPER_ADMIN':
          return {
            ...baseUser,
            role: payload.role,
            departement: payload.departement,
            permissions: payload.permissions || []
          } as Admin;

        case 'STAGIAIRE':
          return {
            ...baseUser,
            role: payload.role,
            dateNaissance: payload.dateNaissance,
            telephone: payload.phone,
            adresse: payload.adresse,
            formations: [] // À récupérer via une autre API si nécessaire
          } as Stagiaire;

        default:
          console.warn('Rôle utilisateur non reconnu:', payload.role);
          return null;
      }

    } catch (error) {
      console.error('Erreur lors de la récupération des infos utilisateur:', error);
      return null;
    }
  }

  /**
   * Vérifie si l'utilisateur connecté est un Admin
   * @returns boolean
   */
  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  }

  /**
   * Vérifie si l'utilisateur connecté est un Super Admin
   * @returns boolean
   */
  isSuperAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'SUPER_ADMIN';
  }

  /**
   * Vérifie si l'utilisateur connecté est un Stagiaire
   * @returns boolean
   */
  isStagiaire(): boolean {
    const user = this.getUser();
    return user?.role === 'STAGIAIRE';
  }

  /**
   * Récupère l'utilisateur typé comme Admin (avec vérification)
   * @returns Admin | null
   */
  getAdmin(): Admin | null {
    const user = this.getUser();
    return this.isAdmin() ? user as Admin : null;
  }

  /**
   * Récupère l'utilisateur typé comme Stagiaire (avec vérification)
   * @returns Stagiaire | null
   */
  getStagiaire(): Stagiaire | null {
    const user = this.getUser();
    return this.isStagiaire() ? user as Stagiaire : null;
  }

  /**
   * Récupère le nom complet de l'utilisateur
   * @returns string | null
   */
  getUserDisplayName(): string | null {
    const user = this.getUser();
    if (!user) return null;

    return `${user.prenom} ${user.nom}`;
  }

  /**
   * Récupère les permissions de l'admin connecté
   * @returns string[] | null
   */
  getUserPermissions(): string[] | null {
    const admin = this.getAdmin();
    return admin?.permissions || null;
  }

  /**
   * Vérifie si l'utilisateur a une permission spécifique
   * @param permission - La permission à vérifier
   * @returns boolean
   */
  hasPermission(permission: string): boolean {
    const permissions = this.getUserPermissions();
    return permissions?.includes(permission) || false;
  }

  /**
   * Récupère l'ID de l'utilisateur connecté
   * @returns number | null
   */
  getUserId(): number | null {
    const user = this.getUser();
    return user ? user.id : null;
  }

  /**
   * Récupère l'email de l'utilisateur connecté
   * @returns string | null
   */
  getUserEmail(): string | null {
    const user = this.getUser();
    return user ? user.email : null;
  }
}

//  service métier pour la logique d’authentification, gestion du token, login, logout, etc
// AuthService sera injecté dans connection et dans app pour les faire communiquer
