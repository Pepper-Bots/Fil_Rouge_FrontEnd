// src/app/services/crud/document.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  constructor(private http: HttpClient) {}

  uploadDocument(type: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', file);

    return this.http.post('/api/documents', formData);
  }
}
