import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { DocumentService } from '../../services/crud/document.service';
import {CommonModule} from '@angular/common';
import {TypeDocument} from '../../models/type-document.enum';
import {MatCard, MatCardContent, MatCardHeader} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {MatFormField} from '@angular/material/input';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {MatButton} from '@angular/material/button';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


@Component({
  selector: 'app-document-upload',
  imports: [ReactiveFormsModule, CommonModule, MatCardContent, MatCard, MatCardHeader, MatIcon, MatFormField, MatSelect, MatOption, MatOption, MatButton, MatButton, MatButton, MatProgressSpinner, MatProgressSpinner,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule],

  templateUrl: './document-upload.component.html',
  styleUrl: './document-upload.component.scss'
})
export class DocumentUploadComponent {
  form: FormGroup;
  selectedFile: File | null = null;
  isUploading = false;
  typesDocument = Object.values(TypeDocument);

  // Récupération des infos utilisateur depuis le service d'ath
  currentUserId: number = 1; // Todo à adapter selon syst d'auth
  currentDossierId: number = 1; // todo à adapter

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      type: ['', Validators.required], // Type de document obligatoire
      file: ['', Validators.required], // Fichier obligatoire
    });
  }

  ngOnInit(): void {
    // Todo ici possible de charger les infos du stagiaire connecté
    // this.loadCurrentUser();
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validation côté client du fichier
      if (this.validateFile(file)) {
        this.selectedFile = file;
        this.form.patchValue({file: file});
        this.form.get('file')?.markAsTouched();
      }
    }
  }

  // todo à comprendre
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  // todo à comprendre
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (this.validateFile(file)) {
        this.selectedFile = file;
        this.form.patchValue({file: file});
        this.form.get('file')?.markAsTouched();
      }
    }
  }

  onSubmit() {
    if (this.form.valid && this.selectedFile) {
      this.isUploading = true;
      const type = this.form.value.type as TypeDocument;

      // Utilisation de la nouvelle méthode avec dossier
      this.documentService.uploadDocumentForDossier(this.currentDossierId, this.selectedFile, type)
        .subscribe({
        next: res => {
          // Notification de succès à l'utilisateur
          this.snackBar.open('Document envoyé avec succès !', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.resetForm(); // Réinitialisation du formulaire

          // Déclencher une notif pour l'admin
          this.notifyAdmin();
        },
        error: err => {
          // Gestion d'erreur avec message utilisateur
          this.snackBar.open('Erreur lors de l\'envoi du document', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          console.error('Erreur upload:', err);
        },
          complete: () => {
            this.isUploading = false;
          }
      });
    } else {
      this.snackBar.open('Veuillez remplir tous les champs requis', 'Fermer', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
    }
  }

  private validateFile(file: File): boolean {
    // Validation taille (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      this.snackBar.open('Fichier trop volumineux (max 10MB)', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return false;
    }

    // Validation format
    const allowedTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // todo s'assurer que les types sont les memes dans le back
    ];
    if (!allowedTypes.includes(file.type)) {
      this.snackBar.open('Format non supporté (PDF, JPEG, PNG, DOC, DOCX uniquement)', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return false;
    }
    return true;
  }

  resetForm() {
    this.form.reset();
    this.selectedFile = null;
  }

  getTypeDisplayName(type: string | TypeDocument): string {
    return this.documentService.getTypeDisplayName(type as TypeDocument);
  }

  formatFileSize(bytes: number): string {
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }

  // Système de notif simple (TODO à améliorer)
  private notifyAdmin() {
    // Pour l'instant, on peut utiliser localStorage pour simuler
    // Dans un vrai système, vous feriez un appel API
    const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    notifications.push({
      id: Date.now(),
      message: `Nouveau document reçu de l'utilisateur ${this.currentUserId}`,
      type: 'document_upload',
      timestamp: new Date().toISOString(),
      read: false
    });
    localStorage.setItem('admin_notifications', JSON.stringify(notifications));
  }

  protected readonly document = document;
}
