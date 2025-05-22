import { Component, inject, signal } from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import { AuthService } from '../auth.service';
import { PopupChangementMdpComponent } from '../popup-changement-mdp.component';
import { CommonModule } from '@angular/common';
import {Router} from '@angular/router';


@Component({
  selector: 'app-connexion',
  standalone: true,
  templateUrl: './connexion.component.html',
  imports: [
    ReactiveFormsModule,
    PopupChangementMdpComponent,
    CommonModule,
    ],
})
export class ConnexionComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);


  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  error = signal<string | null>(null);
  popupVisible = false;
  popupEmail = '';
  showPassword = false;

  onSubmit() {
    if (this.loginForm.invalid) return;
    const { email, password } = this.loginForm.value;

    this.auth.login(email!, password!).subscribe({
      next: (res) => {
        // redirection si succès
        if (res.premiereConnexion) {
          this.popupEmail = email || '';
          this.popupVisible = true;
        } else {
          // redirection vers la page d'accueil.
          this.router.navigate(['/accueil']);
        }
      },
      error: (err) => {
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
    // TODO: Redirige vers la page d'accueil ou dashboard
  }
}
