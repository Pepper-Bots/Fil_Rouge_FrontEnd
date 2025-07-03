import { Component, inject, signal } from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../../../services/auth.service';
import {PopupChangementMdpComponent} from '../popup-changement-mdp/popup-changement-mdp.component';


@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss'],
  imports: [
    ReactiveFormsModule,
    PopupChangementMdpComponent,
    CommonModule,
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

  onSubmit() {
    console.log('🔥 onSubmit appelé !'); // ← Ajoutez ça
    console.log('Form valid ?', this.loginForm.valid); // ← Et ça

    if (this.loginForm.invalid) {
      console.log('⚠️ Formulaire invalide !');
      return;
    }

    const { email, password } = this.loginForm.value;
    console.log('📧 Email:', email, 'Password:', password); // ← Et ça

    console.log(this.loginForm.value) // debug
    console.log("Email envoyé :", email);

    this.auth.login("bruno@example.com", "root").subscribe({
      next: (res) => {

        // 💡 Stocker et décoder le JWT
        this.auth.decodeJwt(res.token);

        // 🎯 Gérer la première connexion
        if (res.premiereConnexion || this.auth.premiereConnexion) {
          this.popupEmail = email || '';
          this.popupVisible = true;

        console.log('Réponse complète:', res);
        console.log('Token JWT:', res.token);

        // ✅ Le JWT est déjà décodé par this.auth.decodeJwt() dans mockLogin
        // Pas besoin de le re-décoder ici

        const role = this.auth.getRole();
        console.log('Rôle extrait du JWT:', role);

        // 🎯 Récupérer premiereConnexion depuis le service, pas depuis res
        const premiereConnexion = this.auth.premiereConnexion;

        // 🎯 Si c'est une première connexion, redirige vers /changer-mdp
        if (premiereConnexion) {
          console.log('Première connexion -> redirection');
          this.router.navigate(['/changer-mdp']);
        } else {
          // redirection vers la page d'accueil.
          this.router.navigate(['/accueil']);
        }
      }

      error: (err:any) => {
        // 🔴 Ici on gère les messages venant du back
        if (err.status === 401) {
          this.error.set("Identifiant ou mot de passe incorrect.");
        } else if (err.status === 403) {
          this.error.set(err.error?.message || "Votre compte n'est pas activé.");
        } else {
          this.error.set("Erreur lors de la connexion. Veuillez réessayer plus tard.");
        }

        console.log('Erreur complète:', err); // ← Ajoutez ça pour debug

        // 🔴 Votre mock rejette les erreurs sans statut HTTP
        // On simplifie temporairement
        this.error.set("Identifiant ou mot de passe incorrect.");

        // // 🔴 Ici, on gère les messages venant du back
        // if (err.status === 401) {
        //   this.error.set("Identifiant ou mot de passe incorrect.");
        // } else if (err.status === 403) {
        //   this.error.set(err.error?.message ?? "Votre compte n'est pas activé.");
        // } else {
        //   this.error.set("Erreur lors de la connexion. Veuillez réessayer plus tard.");
        // }
      }
    },
    error: (err:any) => {
      if (err.status === 401) {
      this.error.set("Identifiant ou mot de passe incorrect.");}
    }
      },
    );
  }

  onClosePopup() {
    this.popupVisible = false;
    this.error.set(null);
    this.error.set(null);
    this.router.navigate(['/changer-mdp']);
    // this.router.navigate(['/accueil']);
    // Redirige si besoin...

    // TODO: Redirige vers la page d'accueil ou dashboard
  }
}
