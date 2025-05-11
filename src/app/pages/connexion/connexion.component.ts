// filepath: c:\Users\helen\OneDrive\Bureau\Metz Numeric School\MNS - CDA\Titre\ADMIN_MNS_Helene_Rizzon_local\Front\admin-mns-front\src\app\pages\connexion\connexion.component.ts
import { Component } from '@angular/core';
import {FormsModule, NgForm} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.css'],
  imports: [
    FormsModule, CommonModule
  ],
  // ou .scss
})
export class ConnexionComponent {
  errorMessage: string = '';

  onSubmit(form: NgForm) {
    if (form.valid) {
      // Logique de connexion (exemple : appel à un service d'authentification)
      console.log('Formulaire soumis', form.value);
    } else {
      this.errorMessage = 'Veuillez remplir correctement le formulaire.';
    }
  }
}
