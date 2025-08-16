import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EvenementService } from '../../../services/crud/evenement.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { MotifAbsence } from '../../../models/motif-absence';
import { DocumentEvenement } from '../../../models/document-evenement';
import { Evenement } from '../../../models/evenement';

// Imports Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-evenement-declaration',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './evenement-declaration.component.html',
  styleUrls: ['./evenement-declaration.component.scss'],
  standalone: true,
})
export class EvenementDeclarationComponent implements OnInit {

  @Output() evenementDeclare = new EventEmitter<any>();

  submitted = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  declarationForm: FormGroup;
  motifs: MotifAbsence[] = [];
  isLoading = false;
  selectedFile: File | null = null;
  uploadedDocument: DocumentEvenement | null = null;
  showSuccess = false;

  constructor(
    private fb: FormBuilder,
    private evenementService: EvenementService,
    private authService: AuthService,
  ) {
    // Formulaire mis à jour avec les nouveaux champs
    this.declarationForm = this.fb.group({
      type: ['ABSENCE', Validators.required],
      motif: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: [''], // Optionnel
      heureArrivee: [''], // Nouveau champ pour l'heure d'arrivée estimée
      description: [''] // Justificatif
    });
  }

  ngOnInit() {
    this.loadMotifs();

    // Écouter les changements de type pour charger les bons motifs
    this.declarationForm.get('type')?.valueChanges.subscribe(() => {
      this.loadMotifs();
      this.declarationForm.get('motif')?.setValue('');
    });
  }

  loadMotifs() {
    const type = this.declarationForm.get('type')?.value;
    this.motifs = this.evenementService.getMotifs(type);
  }

  // === MÉTHODES POUR L'UPLOAD DE FICHIER ===

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedFile = target.files[0];
      console.log('📎 Fichier sélectionné:', this.selectedFile.name);
    }
  }

  removeFile() {
    this.selectedFile = null;
    const fileInput = document.getElementById('document') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // === SOUMISSION DU FORMULAIRE ===

  onSubmit() {
    this.submitted = true;
    this.successMessage = null;
    this.errorMessage = null;

    if (this.declarationForm.invalid) {
      this.markFormGroupTouched();
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    this.isLoading = true;
    const formData = this.declarationForm.value;
    const stagiaireId = 1; // À remplacer par le vrai ID

    // Si un fichier est sélectionné, l'uploader d'abord
    if (this.selectedFile) {
      this.uploadDocument().then(document => {
        this.declareEventWithDocument(formData, stagiaireId, document.id!);
      }).catch(error => {
        console.error('Erreur upload:', error);
        this.errorMessage = "Erreur lors de l'envoi du document.";
        this.isLoading = false;
      });
    } else {
      this.declareEventWithoutDocument(formData, stagiaireId);
    }
  }

  private uploadDocument(): Promise<DocumentEvenement> {
    return new Promise((resolve, reject) => {
      if (!this.selectedFile) {
        reject('Aucun fichier sélectionné');
        return;
      }

      this.evenementService.uploadDocument(this.selectedFile).subscribe({
        next: (document) => {
          console.log('📎 Document uploadé avec succès');
          resolve(document);
        },
        error: reject
      });
    });
  }

  private declareEventWithDocument(formData: any, stagiaireId: number, documentId: number) {
    const evenement: Evenement = {
      stagiaireId,
      type: formData.type,
      dateDebut: formData.dateDebut,
      dateFin: formData.dateFin,
      heureArrivee: formData.heureArrivee,
      motif: formData.motif,
      description: formData.description,
      documentId: documentId
    };

    this.createEvent(evenement);
  }

  private declareEventWithoutDocument(formData: any, stagiaireId: number) {
    const evenement: Evenement = {
      stagiaireId,
      type: formData.type,
      dateDebut: formData.dateDebut,
      dateFin: formData.dateFin,
      heureArrivee: formData.heureArrivee,
      motif: formData.motif,
      description: formData.description
    };

    this.createEvent(evenement);
  }

  private createEvent(evenement: Evenement) {
    this.evenementService.creerEvenement(evenement).subscribe({
      next: (evenementCree) => {
        console.log('✅ Événement déclaré:', evenementCree);
        this.successMessage = "Événement déclaré avec succès.";
        this.showSuccess = true;
        this.isLoading = false;

        // Émission de l'événement vers le parent
        this.evenementDeclare.emit({
          type: evenement.type,
          dateDebut: new Date(evenement.dateDebut),
          dateFin: evenement.dateFin ? new Date(evenement.dateFin) : null,
          heureArrivee: evenement.heureArrivee,
          motif: evenement.motif,
          description: evenement.description,
          document: this.selectedFile
        });

        setTimeout(() => {
          this.resetForm();
          this.showSuccess = false;
          this.successMessage = null;
          this.submitted = false;
        }, 3000);
      },
      error: (error) => {
        console.error('❌ Erreur déclaration:', error);
        this.errorMessage = "Erreur lors de la déclaration.";
        this.isLoading = false;
      }
    });
  }

  resetForm() {
    this.declarationForm.reset({ type: 'ABSENCE' });
    this.selectedFile = null;
  }

  private markFormGroupTouched() {
    Object.keys(this.declarationForm.controls).forEach(key => {
      const control = this.declarationForm.get(key);
      control?.markAsTouched();
    });
  }

  // === GETTERS POUR LE TEMPLATE ===

  get typeControl() { return this.declarationForm.get('type'); }
  get dateDebutControl() { return this.declarationForm.get('dateDebut'); }
  get dateFinControl() { return this.declarationForm.get('dateFin'); }
  get heureArriveeControl() { return this.declarationForm.get('heureArrivee'); }
  get motifControl() { return this.declarationForm.get('motif'); }
  get descriptionControl() { return this.declarationForm.get('description'); }

  getMotifSelected(): MotifAbsence | undefined {
    const motifCode = this.motifControl?.value;
    return this.motifs.find(m => m.code === motifCode);
  }
}
