import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DossierService } from '../../services/crud/dossier.service';
import { Dossier } from '../../models/dossier';

@Component({
  selector: 'app-dossiers-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dossiers-list.component.html',
  styleUrls: ['./dossiers-list.component.scss']
})
export class DossiersListComponent implements OnInit {
  dossiers: {
    id: number;
    codeDossier: string;
    dateCreation: string;
    statutDossier: { id: number; nom: string; couleur: string; description: string };
    nomPrenomStagiaire: string;
    titreFormation: string
  }[] = [];
  pageDossiers: Dossier[] = [];
  pageSize = 20;
  currentPage = 0; // Angular Material est 0-indexed
  totalItems = 0;
  pageSizeOptions = [5, 10, 20, 50];

  loading = true;
  error: string | null = null;

  constructor(
    private dossierService: DossierService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDossiers();
  }

  loadDossiers(useMock: boolean = false): void {
    this.loading = true;

    if (useMock) {
      // Utiliser des données fictives pour les tests
      this.dossiers = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        codeDossier: `CODE-${i + 1}`,
        dateCreation: new Date().toISOString(),
        statutDossier: {
          id: i % 3 + 1,
          nom: i % 3 === 0 ? 'Complet' : i % 3 === 1 ? 'En cours' : 'Incomplet',
          couleur: i % 3 === 0 ? '#28a745' : i % 3 === 1 ? '#ffc107' : '#dc3545',
          description: `Description du statut ${i % 3 + 1}`
        },
        nomPrenomStagiaire: `Stagiaire ${i + 1}`,
        titreFormation: `Formation ${i % 5 + 1}`
      }));

      this.totalItems = this.dossiers.length;
      this.updatePage();
      this.loading = false;
    } else {
      // Utiliser le service pour récupérer les données réelles
      this.dossierService.getDossiersPaginated(this.currentPage, this.pageSize).subscribe(
        (dossiers: Dossier[]) => {
          this.pageDossiers = dossiers;
          this.totalItems = dossiers.length;
          this.loading = false;
        },
        (err: any) => {
          console.error('Erreur lors du chargement des dossiers', err);
          this.error = 'Impossible de charger les dossiers depuis le serveur';
          this.loading = false;

          // Fallback vers les données fictives en cas d'erreur
          this.loadDossiers(true);
        }
      );
    }
  }

  updatePage(): void {
    const start = this.currentPage * this.pageSize;
    this.pageDossiers = this.dossiers.slice(start, start + this.pageSize);
  }

  handlePageEvent(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    // Si nous utilisons des données réelles, rechargez à partir du serveur
    if (this.error === null) {
      this.loadDossiers();
    } else {
      // Sinon, utilisez les données locales
      this.updatePage();
    }
  }

  goToDetail(id: number): void {
    this.router.navigate(['/detail-dossier', id]);
  }

  editDossier(id: number): void {
    this.router.navigate(['/modifier-dossier', id]);
  }

  deleteDossier(id: number, event: Event): void {
    event.stopPropagation(); // Pour éviter la navigation vers la page détail

    if (confirm('Êtes-vous sûr de vouloir supprimer ce dossier ?')) {
      this.dossierService.deleteDossier(id).subscribe({
        next: () => {
          // Après suppression, recharger les données
          this.loadDossiers();
        },
        error: (err: any) => {
          console.error('Erreur lors de la suppression du dossier', err);
          alert('Erreur lors de la suppression du dossier');
        }
      });
    }
  }
}
