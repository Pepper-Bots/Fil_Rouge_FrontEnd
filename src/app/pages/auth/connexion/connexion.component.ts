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

  // Injections modernes avec inject() API
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);
  auth = inject(AuthService);
  route = inject(ActivatedRoute);

  // Formulaire réactif avec validation
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  // Gestion des erreurs avec Angular Signals
  error = signal<string | null>(null);
  connexionType = 'stagiaire'; // valeur par défaut - Interface adaptative

  // Propriétés fonctionnelles - Popup cht de mdp + affichage
  popupVisible = false;
  popupEmail = '';
  showPassword = false;


  constructor() {
    // Met à jour connexionType à chaque changement de query param dans l'URL
    // Adaptation de l'interface selon le type d'utilisateur
    this.route.queryParamMap.subscribe(params => {
      this.connexionType = params.get('type') ?? 'stagiaire';
    });
  }

  // Méthode appelée au clic sur le bouton "Connexion"
  onSubmit() {
    if (this.loginForm.invalid) return;

    const {email, password} = this.loginForm.value;

    this.auth.login(email!, password!).subscribe({
      next: (res) => {

        // Décodage et stockage du JWT
        this.auth.decodeJwt(res.token);
        const role = this.auth.getRole();

        // Gestion de la première connexion
        if (res.premiereConnexion) {
          console.log('Première connexion -> redirection');
          this.router.navigate(['/changer-mdp']);
        } else {
          // Redirection intelligente selon le rôle
          this.redirectBasedOnRole(role);
        }
      },
      error: (err: any) => {
        // Gestion fine des erreurs HTTP
        this.handleLoginError(err);
      }
    });
  }

  private redirectBasedOnRole(role: string | null) {
    const roleNorm = role?.toUpperCase() ?? '';

          if (roleNorm.includes('ADMIN')) {

            this.router.navigate(['/dashboard-admin']);
          } else if (roleNorm.includes('STAGIAIRE')) {
            this.router.navigate(['/dashboard-stagiaire']);
          } else {
            this.router.navigate(['/accueil']);
          }
        }

    private handleLoginError(err: any) {
      if (err.status === 401) {
        this.error.set("Identifiant ou mot de passe incorrect.");
      } else if (err.status === 403) {
        this.error.set("Votre compte n'est pas activé.");
      } else {
        this.error.set("Erreur lors de la connexion. " +
          "Veuillez réessayer plus tard ou contacter un administrateur.");
      }
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
