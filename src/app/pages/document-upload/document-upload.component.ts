import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { DocumentService } from '../../services/crud/document.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-document-upload',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './document-upload.component.html',
  styleUrl: './document-upload.component.scss'
})
export class DocumentUploadComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder, private documentService: DocumentService) {

    // Formulaire avec validation des champs requis
    this.form = this.fb.group({
      type: ['', Validators.required],  // Type de document obligatoire
      file: [null, Validators.required],  // Fichier obligatoire
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validation côté client du fichier
      if (this.validateFile(file)) {
        this.form.patchValue({file: file});
      }
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const {type, file} = this.form.value;

      this.documentService.uploadDocument(type, file).subscribe({
        next: res => {
          // Notification de succès à l'utilisateur
          alert('Document envoyé avec succès');
          this.form.reset(); // Réinitialisation du formulaire
        },
        error: err => {
          // Gestion d'erreur avec message utilisateur
          alert('Erreur lors de l\'envoi du document');
          console.error('Erreur upload:', err);
        }
      });
    }
  }

  private validateFile(file: File): boolean {
    // Validation taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Fichier trop volumineux (max 5MB)');
      return false;
    }

    // Validation format
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Format non supporté (PDF, JPEG, PNG uniquement)');
      return false;
    }
    return true;
  }
}
