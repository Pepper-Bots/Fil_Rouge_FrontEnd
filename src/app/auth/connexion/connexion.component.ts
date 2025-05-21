import { Component, inject, signal } from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import { AuthService } from '../auth.service';
import { PopupChangementMdpComponent } from '../popup-changement-mdp.component';
import { CommonModule } from '@angular/common';


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
        if (res.premiereConnexion) {
          this.popupEmail = email || '';
          this.popupVisible = true;
        } else {
          // redirection...
        }
      },
      error: () => this.error.set("Identifiants incorrects ou compte non activé."),
    });
  }

  onClosePopup() {
    this.popupVisible = false;
    // TODO: Redirige vers la page d'accueil ou dashboard
  }
}
