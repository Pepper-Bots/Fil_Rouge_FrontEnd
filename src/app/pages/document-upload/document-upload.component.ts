import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  DocumentService,
  StatutDossierFormation
} from '../../services/crud/document.service';
import {CommonModule} from '@angular/common';
import {TypeDocument} from '../../models/type-document.enum';
import {MatCard, MatCardContent, MatCardHeader, MatCardModule} from '@angular/material/card';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {MatFormField, MatInputModule} from '@angular/material/input';
import {MatSelect, MatSelectModule} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {MatButton, MatButtonModule} from '@angular/material/button';
import {MatProgressSpinner, MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {AuthService} from '../../services/auth.service';
import {MatProgressBar} from '@angular/material/progress-bar';
import {FormationService} from '../../services/crud/formation.service';


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
    MatSnackBarModule, MatProgressBar],

  templateUrl: './document-upload.component.html',
  styleUrl: './document-upload.component.scss'
})
export class DocumentUploadComponent implements OnInit {
  form: FormGroup;
  selectedFile: File | null = null;
  isUploading = false;
  typesDocument = Object.values(TypeDocument);

  // Gestion des formations
  formations: StatutDossierFormation[] = [];
  selectedFormation: StatutDossierFormation | null = null;
  isLoadingFormations = true;

  // Données du dossier
  statutDossierFormation: StatutDossierFormation | null = null;
  documentsRequisFormation: TypeDocument[] = [];
  isLoadingDossier = true;

  // Récupération des infos utilisateur depuis le service d'auth
  currentUserId: number | null = null;
  isDragOver = false;

  sidebarCollapsed = false;

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService,
    private formationService: FormationService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      formation: ['', Validators.required], // Formation obligatoire
      type: ['', Validators.required],       // Type de document obligatoire
      file: ['', Validators.required],       // Fichier obligatoire
    });
  }

  ngOnInit(): void {
    console.log('🔍 DEBUG - Current User ID:', this.authService.getUserId());
    this.loadCurrentUser();
    this.chargerFormationsAvecStatut();
  }

  /**
   * Charge les informations de l'utilisateur connecté
   */
  // private loadCurrentUser(): void {
  //   this.currentUserId = this.authService.getUserId();
  //   if (!this.currentUserId) {
  //     this.snackBar.open('Erreur: Utilisateur non connecté', 'Fermer', {
  //       duration: 3000,
  //       panelClass: ['error-snackbar']
  //     });
  //   }
  // }

  // ⚠️ Version test
  private loadCurrentUser(): void {
    this.currentUserId = this.authService.getUserId();
    if (!this.currentUserId) {
      console.log('Mode test : utilisation de l\'ID utilisateur de test');
      this.currentUserId = 5; // ID d'un stagiaire
    }
  }

  /**
   * Charge les formations du stagiaire
   */
  private chargerFormationsAvecStatut(): void {
    if (!this.currentUserId) {
      this.isLoadingFormations = false;
      return;
    }

    this.isLoadingFormations = true;

    // Timeout de sécurité
    setTimeout(() => {
      if (this.isLoadingFormations) {
        this.isLoadingFormations = false;
        console.warn('Timeout formations - passage en mode test');
      }
    }, 5000);

    this.documentService.getFormationsAvecStatutDocuments(this.currentUserId).subscribe({
      next: (formations) => {
        this.formations = formations;
        console.log('📚 Formations avec statut chargées:', formations);
      },
      error: (error) => {
        console.error('Erreur chargement formations avec statut:', error);
        this.snackBar.open('Impossible de charger les formations', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      },
      complete: () => {
        this.isLoadingFormations = false;
      }
    });
  }

  /**
   * Gestion du changement de formation sélectionnée
   */
  onFormationChange(formation: StatutDossierFormation): void {
    this.selectedFormation = formation;
    this.statutDossierFormation = formation;
    this.documentsRequisFormation = formation.documentsRequis;
    this.form.patchValue({ formation: formation.id });

    console.log('📋 Documents requis pour formation:', this.documentsRequisFormation);
    console.log('📊 Statut dossier formation:', this.statutDossierFormation);
  }

  getDescriptionFormation(): string {
    if (!this.selectedFormation) {
      return '';
    }
    return this.formationService.getDescriptionDetaillee(this.selectedFormation.id);
  }

  /**
   * Récupère les formations auxquelles le stagiaire est inscrit
   */
  getFormationsInscrites(): StatutDossierFormation[] {
    return this.formations.filter(formation =>
      formation.statutDossier !== 'NON_INSCRIT'
    );
  }

  /**
   * Sélectionne une formation et déclenche l'affichage des documents
   */
  selectFormation(formation: StatutDossierFormation): void {
    this.form.patchValue({ formation: formation });
    this.onFormationChange(formation);
  }

  /**
   * Affiche les détails d'une formation (scroll vers la description)
   */
  voirDetailsFormation(formation: StatutDossierFormation): void {
    this.selectFormation(formation);

    // Scroll vers la section description
    setTimeout(() => {
      const element = document.querySelector('.formation-description');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  /**
   * Récupère le niveau d'une formation par son ID
   */
  getNiveauFormationById(formationId: number): string {
    return this.formationService.getNiveauFormation(formationId);
  }

  /**
   * Récupère la durée d'une formation par son ID
   */
  getDureeFormationById(formationId: number): number {
    return this.formationService.getDureeFormation(formationId);
  }

  /**
   * Récupère le label d'affichage du statut
   */
  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'COMPLET': 'Formation en cours',
      'EN_VALIDATION': 'Dossier en validation',
      'INCOMPLET': 'Inscription en cours',
      'NON_INSCRIT': 'Non inscrit'
    };
    return labels[statut] || statut;
  }

  getFormattedDescription(): string {
    let description = this.getDescriptionFormation();

    // Convertir **texte** en <strong>texte</strong>
    description = description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convertir _texte_ en <em>texte</em>
    description = description.replace(/_(.*?)_/g, '<em>$1</em>');

    return description;
  }

  getNiveauFormation(): string {
    if (!this.selectedFormation) {
      return '';
    }
    return this.formationService.getNiveauFormation(this.selectedFormation.id);
  }

  getDureeFormation(): number {
    if (!this.selectedFormation) {
      return 0;
    }
    return this.formationService.getDureeFormation(this.selectedFormation.id);
  }
  /**
   * Charge les documents requis pour une formation
   */
  private chargerDocumentsRequisFormation(formationId: number): void {
    this.documentService.getDocumentsRequisFormation(formationId).subscribe({
      next: (documentsRequis) => {
        this.documentsRequisFormation = documentsRequis;
        console.log('📋 Documents requis pour formation:', documentsRequis);
      },
      error: (error) => {
        console.error('Erreur chargement documents requis formation:', error);
      }
    });
  }

  /**
   * Récupère une description pour un type de document
   */
  getDocumentDescription(type: TypeDocument): string {
    const descriptions: { [key in TypeDocument]: string } = {
      [TypeDocument.CV]: 'Document présentant votre parcours professionnel et académique',
      [TypeDocument.LETTRE_MOTIVATION]: 'Lettre expliquant votre motivation pour cette formation',
      [TypeDocument.PORTFOLIO]: 'Présentation de vos projets et réalisations',
      [TypeDocument.DIPLOME_BAC]: 'Copie de votre diplôme du baccalauréat',
      [TypeDocument.DIPLOME_BAC_2]: 'Copie de votre diplôme de niveau Bac+2',
      [TypeDocument.DIPLOME_BAC_3]: 'Copie de votre diplôme de niveau Bac+3 ou plus',
      [TypeDocument.PIECE_IDENTITE]: 'Copie recto-verso de votre carte d\'identité ou passeport',
      [TypeDocument.ATTEST_RESP_CIVILE]: 'Attestation d\'assurance responsabilité civile',
      [TypeDocument.JUSTIF_SITUATION]: 'Document justifiant votre situation actuelle',
      [TypeDocument.JUSTIFICATIF]: 'Document justificatif général',
      [TypeDocument.AUTRE]: 'Autre document'
    };
    return descriptions[type] || '';
  }


  /**
   * Vérifie si le stagiaire est inscrit à cette formation
   */
  isInscritToFormation(formation: StatutDossierFormation): boolean {
    return formation.statutDossier !== 'NON_INSCRIT';
  }

  /**
   * Récupère un message informatif selon le statut d'inscription
   */
  getInformationFormation(formation: StatutDossierFormation): string {
    if (this.isInscritToFormation(formation)) {
      return `Vous êtes inscrit à cette formation. Dossier ${formation.statutDossier.toLowerCase()}.`;
    } else {
      return `Cette formation nécessite ${formation.nombreDocumentsRequis} documents pour l'inscription.`;
    }
  }


  /**
   * Charge le statut du dossier pour une formation spécifique
   */
  private chargerStatutDossierFormation(formationId: number): void {
    if (!this.currentUserId) return;

    this.isLoadingDossier = true;
    this.documentService.getStatutDossierFormation(formationId, this.currentUserId).subscribe({
      next: (statut) => {
        this.statutDossierFormation = statut;
        console.log('📊 Statut dossier formation:', statut);
      },
      error: (error) => {
        console.error('Erreur chargement statut dossier formation:', error);
        this.snackBar.open('Impossible de charger le statut du dossier', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      },
      complete: () => {
        this.isLoadingDossier = false;
      }
    });
  }

  /**
   * Gestion de la sélection de fichier via input
   */
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.traiterFichierSelectionne(file);
    }
  }

  /**
   * Gestion du drag & drop
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.traiterFichierSelectionne(files[0]);
    }
  }

  /**
   * Traite le fichier sélectionné (validation + mise à jour form)
   */
  private traiterFichierSelectionne(file: File): void {
    if (this.validateFile(file)) {
      this.selectedFile = file;
      this.form.patchValue({ file: file });
      this.form.get('file')?.markAsTouched();

      // Auto-détection du type de document
      const typeDetecte = this.detecterTypeDocument(file.name);
      if (typeDetecte && !this.form.get('type')?.value) {
        this.form.patchValue({ type: typeDetecte });
      }
    }
  }

  /**
   * Upload du document
   */
  onSubmit() {
    if (this.form.valid && this.selectedFile && this.selectedFormation && this.currentUserId) {
      this.isUploading = true;
      const type = this.form.value.type as TypeDocument;

      // Utilisation de la méthode avec formation
      this.documentService.uploadDocumentForFormation(
        this.selectedFormation.id,
        this.currentUserId,
        this.selectedFile,
        type
      ).subscribe({
        next: res => {
          // Notification de succès à l'utilisateur
          this.snackBar.open('Document envoyé avec succès !', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.resetForm(); // Réinitialisation du formulaire

          // ✅ AMÉLIORATION : Recharger toutes les formations pour avoir les dernières données
          // Plus robuste que de recharger juste une formation
          this.chargerFormationsAvecStatut();

          this.notifyAdmin(); // Déclencher une notif pour l'admin
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
      // Messages d'erreur spécifiques
      if (!this.selectedFormation) {
        this.snackBar.open('Veuillez sélectionner une formation', 'Fermer', {
          duration: 3000,
          panelClass: ['warning-snackbar']
        });
      } else if (!this.form.get('type')?.value) {
        this.snackBar.open('Veuillez sélectionner un type de document', 'Fermer', {
          duration: 3000,
          panelClass: ['warning-snackbar']
        });
      } else if (!this.selectedFile) {
        this.snackBar.open('Veuillez sélectionner un fichier', 'Fermer', {
          duration: 3000,
          panelClass: ['warning-snackbar']
        });
      } else {
        this.snackBar.open('Veuillez remplir tous les champs requis', 'Fermer', {
          duration: 3000,
          panelClass: ['warning-snackbar']
        });
      }
    }
  }

  /**
   * Upload rapide pour un type de document spécifique
   */
  uploaderDocumentRapide(type: TypeDocument): void {
    if (!this.selectedFormation) {
      this.snackBar.open('Veuillez d\'abord sélectionner une formation', 'Fermer', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    // Déclencher le sélecteur de fichier avec type pré-sélectionné
    this.form.patchValue({ type: type });
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = this.getAcceptedTypes();
    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        this.form.patchValue({ file: file });
        this.onSubmit(); // Upload automatique
      }
    };
    fileInput.click();
  }

  /**
   * Vérifie si un type de document est requis pour la formation sélectionnée
   */
  isDocumentRequis(type: TypeDocument): boolean {
    return this.documentsRequisFormation.includes(type);
  }

  /**
   * Vérifie si un type de document a déjà été uploadé
   */
  isDocumentUploade(type: TypeDocument): boolean {
    if (!this.statutDossierFormation) return false;
    return this.statutDossierFormation.documentsUploades.includes(type);
  }

  /**
   * Récupère le statut d'un document spécifique
   */
  getDocumentStatus(type: TypeDocument): string {
    if (!this.statutDossierFormation) return 'MANQUANT';

    const isUploaded = this.statutDossierFormation.documentsUploades.includes(type);
    if (!isUploaded) return 'MANQUANT';

    // Pour un statut plus précis, tu pourrais ajouter une propriété documentsStatuts dans le DTO
    // En attendant, logique simplifiée :
    return 'EN_ATTENTE'; // Document uploadé mais en attente de validation
  }

  /**
   * Validation du fichier
   */
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
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // TODO: s'assurer que les types sont les mêmes dans le back
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

  /**
   * Détection automatique du type de document
   */
  private detecterTypeDocument(filename: string): TypeDocument | null {
    const name = filename.toLowerCase();
    if (name.includes('cv')) return TypeDocument.CV;
    if (name.includes('identite') || name.includes('carte') || name.includes('cni')) return TypeDocument.PIECE_IDENTITE;
    if (name.includes('diplome') || name.includes('bac')) return TypeDocument.DIPLOME_BAC;
    if (name.includes('lettre') || name.includes('motivation')) return TypeDocument.LETTRE_MOTIVATION;
    return null;
  }

  /**
   * Réinitialisation du formulaire
   */
  resetForm() {
    // Ne pas réinitialiser la formation sélectionnée
    const formationValue = this.form.get('formation')?.value;
    this.form.reset();
    this.form.patchValue({ formation: formationValue });
    this.selectedFile = null;
  }

  /**
   * Méthodes utilitaires pour l'affichage
   */
  getTypeDisplayName(type: string | TypeDocument): string {
    return this.documentService.getTypeDisplayName(type as TypeDocument);
  }

  formatFileSize(bytes: number): string {
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }

  getAcceptedTypes(): string {
    return '.pdf,.jpg,.jpeg,.png,.doc,.docx';
  }

  getStatusIcon(statut?: string): string {
    return this.documentService.getStatusIcon(statut || 'MANQUANT');
  }

  getStatusColor(statut?: string): string {
    return this.documentService.getStatusColor(statut || 'MANQUANT');
  }

  /**
   * Récupère les types de documents disponibles pour la formation + le type AUTRE
   */
  getTypesDocumentsDisponibles(): TypeDocument[] {
    const documentsRequis = this.documentsRequisFormation || [];

    // Ajouter AUTRE s'il n'est pas déjà dans les requis
    if (!documentsRequis.includes(TypeDocument.AUTRE)) {
      return [...documentsRequis, TypeDocument.AUTRE];
    }

    return documentsRequis;
  }

  /**
   * Récupère le pourcentage de complétion pour la formation sélectionnée
   */
  getPourcentageCompletion(): number {
    return this.statutDossierFormation?.pourcentageCompletion || 0;
  }

  /**
   * Vérifie si le dossier est complet pour la formation sélectionnée
   */
  isDossierComplet(): boolean {
    return this.statutDossierFormation?.statutDossier === 'COMPLET';
  }

  /**
   * Système de notification simple
   */
  private notifyAdmin(): void {
    // Pour l'instant, on peut utiliser localStorage pour simuler
    // Dans un vrai système, on ferait un appel API
    const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    notifications.push({
      id: Date.now(),
      message: `Nouveau document reçu de l'utilisateur ${this.currentUserId} pour la formation ${this.selectedFormation?.nom}`,
      type: 'document_upload',
      timestamp: new Date().toISOString(),
      read: false,
      formationId: this.selectedFormation?.id,
      userId: this.currentUserId
    });
    localStorage.setItem('admin_notifications', JSON.stringify(notifications));
  }

  protected readonly document = document;
}
