import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AffichageDossiersComponent} from '../affichage-dossiers/affichage-dossiers.component';
import {CommonModule} from '@angular/common';

interface Dossier {
  id: number;
  nom: string;
  // TODO à ajuster selon entité Dossier
  statut: 'complet' | 'incomplet';
}

@Component({
  selector: 'app-dossiers-list',
  imports: [CommonModule, AffichageDossiersComponent],
  templateUrl: './dossiers-list.component.html',
  styleUrl: './dossiers-list.component.scss',
  standalone: true
})

export class DossiersListComponent implements OnInit {
  dossiers: Dossier[] = [];
  pageDossiers: Dossier[] = [];
  pageSize = 20;
  currentPage = 1;
  totalPages = 0;

  constructor(private router: Router) {}

    ngOnInit(): void {
      this.dossiers = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        nom: `Dossier ${i + 1}`,
        statut: i % 2 === 0 ? 'complet' : 'incomplet'
    }));

    this.totalPages = Math.ceil(this.dossiers.length / this.pageSize);
    this.setPage(1);
    }

    setPage(page: number): void {
      this.currentPage = page;
      const start = (page - 1) * this.pageSize;
      this.pageDossiers = this.dossiers.slice(start, start + this.pageSize);
  }

  goToDetail(id: number): void {
    this.router.navigate(['/dossier', id]);
  }

}
