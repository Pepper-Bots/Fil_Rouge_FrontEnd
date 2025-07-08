import { Component, inject, signal } from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../../../services/auth.service';
import {PopupChangementMdpComponent} from '../popup-changement-mdp/popup-changement-mdp.component';
import {jwtDecode} from 'jwt-decode';


@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss'],
  imports: [
    ReactiveFormsModule,
    PopupChangementMdpComponent,
    CommonModule,
    RouterLink
    ],
})
export class ConnexionComponent {
   fb = inject(FormBuilder);
   http = inject(HttpClient);
   // notification = inject(NotificationService);
   router = inject(Router);
  auth = inject(AuthService);
  route = inject(ActivatedRoute);


  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  error = signal<string | null>(null);
  popupVisible = false;
  popupEmail = '';
  showPassword = false;
  connexionType = 'stagiaire'; // valeur par défaut


  constructor() {
    // Met à jour connexionType à chaque changement de query param dans l'URL
    this.route.queryParamMap.subscribe(params => {
      this.connexionType = params.get('type') ?? 'stagiaire';
    });
  }

  // Méthode appelée au clic sur le bouton "Connexion"
  onSubmit() {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;

    console.log(this.loginForm.value) // debug
    console.log("Email envoyé :", email);

    this.auth.login(email!, password!).subscribe({
      next: (res) => {
        console.log('Token JWT:', res.token);
        const payload = jwtDecode<any>(res.token);
        console.log('Payload JWT:', payload);

        // Ici res doit contenir { token: "...", ... }
        // 💡 Stocker et décoder le JWT
        this.auth.decodeJwt(res.token);

        const role = this.auth.getRole();
        console.log('Rôle extrait du JWT:', role);

        // 🎯 Si c'est une première connexion, redirige vers /changer-mdp
        if (res.premiereConnexion) {
          console.log('Première connexion -> redirection');
          this.router.navigate(['/changer-mdp']);
        } else {
          // 🟢 Redirection robuste selon le rôle
          const roleNorm = role?.toUpperCase() ?? '';

          // if (res.premiereConnexion || this.auth.premiereConnexion) {
          //   this.popupEmail = email || '';
          //   this.popupVisible = true;


          if (roleNorm.includes('ADMIN')) {
            console.log('Redirection dashboard admin');
            console.log('role en localStorage:', localStorage.getItem('role'));
            this.router.navigate(['/dashboard-admin']);
          } else if (roleNorm.includes('STAGIAIRE')) {
            console.log('Redirection dashboard stagiaire');
            this.router.navigate(['/dashboard-stagiaire']);
          } else {
            console.log('Redirection accueil');
            this.router.navigate(['/accueil']);
          }
        }
      },

      error: (err: any) => {
        // 🔴 Ici on gère les messages venant du back
        if (err.status === 401) {
          this.error.set("Identifiant ou mot de passe incorrect.");
        } else if (err.status === 403) {
          this.error.set(err.error?.message || "Votre compte n'est pas activé.");
        } else {
          this.error.set("Erreur lors de la connexion. Veuillez réessayer plus tard.");
        }
      }
    });
  }

  onClosePopup() {
    this.popupVisible = false;
    this.error.set(null);
    this.router.navigate(['/changer-mdp']);

  }
}

// Pour tests :

// Admin : admin@test.com + n'importe quel mot de passe
// Super Admin : super@test.com + n'importe quel mot de passe
// Stagiaire : stagiaire@test.com + n'importe quel mot de passe
// Première connexion : new@test.com + n'importe quel mot de passe
