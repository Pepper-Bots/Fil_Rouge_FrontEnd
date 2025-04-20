import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  connecte = false;
  role : string | null = null;

  constructor() {
    const jwt = localStorage.getItem("jwt")
    if (jwt != null) {
      this.decodeJwt(jwt)  // -> pas vraiment 'connexion' mais plutot extraction de données  -> on renomme
    }
  }

  decodeJwt(jwt: string) {
    localStorage.setItem("jwt", jwt)

    // on découpe le jwt en 3 parties séparées par un point
    const splitJwt = jwt.split(".");

    // On récupère la partie 'body' du jwt
    const jwtBody = splitJwt[1];

    // On décode la base 64
    const jsonBody = atob(jwtBody);

    // on transforme le json en objet js
    const body = JSON.parse(jsonBody);

    // Vérification (en première intention)
    // console.log(body)

    this.role = body.role;

    // console.log(atob()); // fonction a to be (atob) pour déchiffrer le jwt

    this.connecte = true;
  }

  deconnexion(){
    localStorage.removeItem("jwt")
    this.connecte = false;
    this.role = null;
  }
}


// AuthService sera injecté dans connection et dans app pour les faire communiquer
