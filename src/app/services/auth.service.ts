import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  connecte = false
  role: string | null = null;

  constructor() {
    const jwt = localStorage.getItem('jwt');
    if (jwt != null) {
      this.decodeJwt(jwt)
    }
  }

  decodeJwt(jwt: string) {
    localStorage.setItem('jwt', jwt);

    const splitJwt = jwt.split('.');

    const jwtBody = splitJwt[1];

    const jsonBody = atob(jwtBody);

    const body = JSON.parse(jsonBody);

    this.role = body.role;

    this.connecte = true;
  }

  deconnexion(){
    localStorage.removeItem('jwt');
    this.connecte = false;
    this.role = null;
  }
}
