import { Component, OnInit } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DossierService } from '../../services/crud/dossier.service';
import { Dossier } from '../../models/dossier';
import {StatutDossier} from '../../models/statut-dossier';

@Component({
  selector: 'app-dossiers-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    RouterLink
  ],
  templateUrl: './dossiers-list.component.html',
  styleUrls: ['./dossiers-list.component.scss']
})
export class DossiersListComponent implements OnInit {
  dossiers: Dossier[] = [];      // Toutes les données (pour mock)
  pageDossiers: Dossier[] = [];  // Page courante affichée
  pageSize = 20;
  currentPage = 0;
  totalItems = 0;
  pageSizeOptions = [5, 10, 20, 50];

  loading = true;
  error: string | null = null;

  statutColorMap: { [key: string]: string } = {
    'Complet': '#28a745',
    'En cours': '#ffc107',
    'Incomplet': '#dc3545'
  };

  getStatutColor(statut: StatutDossier | undefined): string {
    if (!statut) return '#ccc';
    return this.statutColorMap[statut.nomStatut] || '#ccc';
  }


  constructor(
    private dossierService: DossierService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDossiers();
  }

  loadDossiers(useMock: boolean = false): void {
    this.loading = true;
    this.error = null;


    if (useMock) {
      // Utiliser des données fictives pour les tests
      this.dossiers = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        codeDossier: `CODE-${i + 1}`,
        dateCreation: new Date().toISOString(),
        statutDossier: {
          id: i % 3 + 1,
          nomStatut: i % 3 === 0 ? 'Complet' : i % 3 === 1 ? 'En cours' : 'Incomplet',
          couleur: i % 3 === 0 ? '#28a745' : i % 3 === 1 ? '#ffc107' : '#dc3545'
        },
        nomPrenomStagiaire: `Stagiaire ${i + 1}`,
        titreFormation: `Formation ${i % 5 + 1}`,
        stagiaire: { id: 1, lastName: "Dupont", firstName: "Jean", email: "", enabled: true }, // valeurs fictives !
        formation: { id: 1, nom: "Formation test" },
        createur: { id: 1, lastName: "Admin", firstName: "Admin", email: "", enabled: true }
      } as Dossier));


      this.totalItems = this.dossiers.length;
      this.updatePage();
      this.loading = false;
    } else {
      // Utiliser le service pour récupérer les données réelles
      this.dossierService.getDossiersPaginated(this.currentPage, this.pageSize).subscribe({
        complete(): void {
        },
        next: (res: { dossiers: Dossier[], totalItems: number }) => {
          this.pageDossiers = res.dossiers;
          this.totalItems = res.totalItems;
          this.loading = false;
        },
        error:(err: any) => {
          console.error('Erreur lors du chargement des dossiers', err);
          this.error = 'Impossible de charger les dossiers depuis le serveur';
          this.loading = false;

        // Fallback vers les données fictives en cas d'erreur
        // this.loadDossiers(true);
      }
    });
  }
}

  updatePage(): void {
    const start = this.currentPage * this.pageSize;
    this.pageDossiers = this.dossiers.slice(start, start + this.pageSize);
  }

  handlePageEvent(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadDossiers();
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
        next: () => this.loadDossiers(),
          // Après suppression, recharger les données
        error: (err: any) => {
          console.error('Erreur lors de la suppression du dossier', err);
          alert('Erreur lors de la suppression du dossier');
        }
      });
    }
  }
}
