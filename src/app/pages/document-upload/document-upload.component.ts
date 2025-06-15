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
    this.form = this.fb.group({
      type: ['', Validators.required],
      file: [null, Validators.required],
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.form.patchValue({ file: file });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const { type, file } = this.form.value;
      this.documentService.uploadDocument(type, file).subscribe({
        next: res => alert('Document envoyé'),
        error: err => alert('Erreur lors de l\'envoi')
      });
    }
  }
}
