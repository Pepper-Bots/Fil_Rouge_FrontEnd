import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {EvenementService} from '../../../services/crud/evenement.service';
import { CommonModule } from '@angular/common';
import {AuthService} from '../../../services/auth.service';
import {MotifAbsence} from '../../../models/motif-absence';
import {DocumentEvenement} from '../../../models/document-evenement';
import {Evenement} from '../../../models/evenement';

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
export class EvenementDeclarationComponent implements OnInit {

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
    this.declarationForm = this.fb.group({
      type: ['ABSENCE', Validators.required],
      date: ['', Validators.required],
      motif: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit()  {
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
  // Utiliser un ID fixe pour le mock
  const stagiaireId = 1; // à remplacer par le vrai id !

    // Si un fichier est sélectionné, l'uploader d'abord
  if (this.selectedFile) {
    this.uploadDocument().then(document => {
      this.declareEventWithDocument (formData, stagiaireId, document.id!);
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
      date: formData.date,
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
      date: formData.date,
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
  get dateControl() { return this.declarationForm.get('date'); }
  get motifControl() { return this.declarationForm.get('motif'); }

  getMotifSelected(): MotifAbsence | undefined {
    const motifCode = this.motifControl?.value;
    return this.motifs.find(m => m.code === motifCode);
  }

}
