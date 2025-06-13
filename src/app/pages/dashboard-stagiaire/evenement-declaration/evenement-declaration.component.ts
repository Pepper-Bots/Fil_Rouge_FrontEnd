import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Evenement} from '../../../models/evenement';
import {EvenementService} from '../../../services/crud/evenement.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-evenement-declaration',
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './evenement-declaration.component.html',
  styleUrls: ['./evenement-declaration.component.scss'],
  standalone: true,
})
export class EvenementDeclarationComponent {
  evenementForm: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private evenementService: EvenementService
  ) {
    this.evenementForm = this.fb.group({
      type: ['', Validators.required],
      motif: ['', Validators.required],
      date: ['', Validators.required]
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.evenementForm.invalid) {
      return;
    }

    const newEvenement: Evenement = {
      type: this.evenementForm.value.type,
      motif: this.evenementForm.value.motif,
      date: this.evenementForm.value.date,
      stagiaireId: 123 // à remplacer par l'ID réel du stagiaire connecté
    };

    this.evenementService.creerEvenement(newEvenement).subscribe({
      next: () => {
        this.successMessage = 'Événement déclaré avec succès !';
        this.errorMessage = '';
        this.evenementForm.reset();
        this.submitted = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la déclaration : ' + err.message;
        this.successMessage = '';
      }
    });
  }
}
