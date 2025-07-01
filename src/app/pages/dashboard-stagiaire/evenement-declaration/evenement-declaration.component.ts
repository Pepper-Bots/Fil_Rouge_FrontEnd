import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Evenement, MotifAbsence, Document} from '../../../models/evenement';
import {EvenementService} from '../../../services/crud/evenement.service';
import { CommonModule } from '@angular/common';
import {AuthService} from '../../../services/auth.service';

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

  declarationForm: FormGroup;
  motifs: MotifAbsence[] = [];
  isLoading = false;
  selectedFile: File | null = null;
  uploadedDocument: Document | null = null;
  showSuccess = false;

  constructor(
    private fb: FormBuilder,
    private evenementService: EvenementService,
    private authService: AuthService,
  ) {
    this.declarationForm = this.fb.group({
      type: ['ABSENCE', Validators.required],
      dateEvenement: ['', Validators.required],
      motif: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit()  {
    this.loadMotifs();

    this.declarationForm.get('type')?.valueChanges.subscribe(() => {
    this.loadMotifs();
    this.declarationForm.get('motif')?.setValue('');
  });
}

loadMotifs() {
  const type = this.declarationForm.get('type')?.value;
  this.motifs = this.evenementService.getMotifs(type);
}

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


onSubmit() {
  if (this.declarationForm.invalid) {
    this.markFormGroupTouched();
    return;
    }

  this.isLoading = true;
  const formData = this.declarationForm.value;
  const stagiaireId = this.authService.getUserId();

  if (!stagiaireId) {
    console.error('Stagiaire ID non trouvé');
    this.isLoading = false;
    return;
  }

  if (this.selectedFile) {
    this.uploadDocument().then(document => {
      this.declareEvent(formData, stagiaireId, document.id);
    }).catch(error => {
      console.error('Erreur upload:', error);
      this.isLoading = false;
    });
  } else {
    this.declareEvent(formData, stagiaireId);
  }
}

  private uploadDocument(): Promise<Document> {
    return new Promise((resolve, reject) => {
      if (!this.selectedFile) {
        reject('Aucun fichier sélectionné');
        return;
      }

      this.evenementService.uploadDocument(this.selectedFile).subscribe({
        next: (document) => {
          this['uploadedDocument'] = document;
          resolve(document);
        },
        error: reject
      });
    });
  }

  private declareEvent(formData: any, stagiaireId: number, documentId?: number) {
    const evenement = {
      stagiaireId,
      type: formData.type,
      dateEvenement: formData.dateEvenement,
      motif: formData.motif,
      description: formData.description,
      documentId: documentId
    };


    this.evenementService.creerEvenement(evenement).subscribe({
      next: (evenementCree) => {
        console.log('✅ Événement déclaré:', evenementCree);
        this.showSuccess = true;
        this.isLoading = false;

        setTimeout(() => {
          this.resetForm();
          this.showSuccess = false;
        }, 3000);
      },
      error: (error) => {
        console.error('❌ Erreur déclaration:', error);
        this.isLoading = false;
      }
    });
  }

  resetForm() {
    this.declarationForm.reset({ type: 'ABSENCE' });
    this.selectedFile = null;
    this.uploadedDocument = null;
  }

  private markFormGroupTouched() {
    Object.keys(this.declarationForm.controls).forEach(key => {
      const control = this.declarationForm.get(key);
      control?.markAsTouched();
    });
  }

  get typeControl() { return this.declarationForm.get('type'); }
  get dateControl() { return this.declarationForm.get('dateEvenement'); }
  get motifControl() { return this.declarationForm.get('motif'); }

  getMotifSelected(): MotifAbsence | undefined {
    const motifCode = this.motifControl?.value;
    return this.motifs.find(m => m.code === motifCode);
  }
}
