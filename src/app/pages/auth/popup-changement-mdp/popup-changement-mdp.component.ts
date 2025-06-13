import { Component, inject, Input, Output, EventEmitter, signal } from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {AuthService} from '../../../services/auth.service';


@Component({
  selector: 'app-popup-changement-mdp',
  standalone: true,
  templateUrl: './popup-changement-mdp.component.html',
  imports: [
    ReactiveFormsModule, CommonModule
  ],
})
export class PopupChangementMdpComponent {
  @Input() email!: string;
  @Output() close = new EventEmitter<void>();
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  error = signal<string | null>(null);

  mdpForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', [Validators.required]]
  });

  onSubmit() {
    if (this.mdpForm.invalid) return;
    const { newPassword, confirm } = this.mdpForm.value;
    if (newPassword !== confirm) {
      this.error.set("Les mots de passe ne correspondent pas.");
      return;
    }

    this.auth.changePassword(this.email, newPassword!).subscribe({
      next: () => {
        this.close.emit();
        // Redirige vers le tableau de bord, etc.
      },
      error: () => this.error.set("Erreur lors du changement de mot de passe."),
    });
  }
}

// Composant UI pour afficher une popup (modale) de changement mot de passe.
