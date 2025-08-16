import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Subscription } from 'rxjs';

import {
  DashboardStagiaireService,
  StagiaireProfile,
  DossierInscription
} from '../../services/crud/dashboard-stagiaire.service';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatIcon,
    MatButton,
    MatProgressBar
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {

  profile: StagiaireProfile | null = null;
  dossier: DossierInscription | null = null;
  isLoading = true;

  private subscriptions: Subscription[] = [];

  constructor(private dashboardService: DashboardStagiaireService) {}

  ngOnInit(): void {
    this.loadProfileData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadProfileData(): void {
    // Souscription au profil
    const profileSub = this.dashboardService.profile$.subscribe(
      profile => {
        this.profile = profile;
        this.isLoading = false;
      }
    );

    // Souscription au dossier
    const dossierSub = this.dashboardService.dossier$.subscribe(
      dossier => this.dossier = dossier
    );

    this.subscriptions.push(profileSub, dossierSub);

    // Charger les données si pas encore chargées
    if (!this.profile) {
      this.dashboardService.getProfile().subscribe();
      this.dashboardService.getDossierInscription().subscribe();
    }
  }

  // ==================== GETTERS ====================

  get formationNomComplet(): string {
    return this.profile?.formation?.nom || 'Aucune formation assignée';
  }

  get formationNiveau(): string {
    if (!this.profile?.formation?.niveau) return '';

    switch (this.profile.formation.niveau) {
      case 'A': return 'Niveau Bac+2';
      case 'B': return 'Niveau Bac+3';
      case 'C': return 'Niveau Bac+5';
      default: return '';
    }
  }

  get statutCompte(): string {
    return this.profile?.enCoursDeValidation ? 'En cours de validation' : 'Compte validé';
  }

  get progressionDossier(): number {
    return this.dossier?.progression || 0;
  }

  // ==================== ACTIONS ====================

  editProfile(): void {
    // TODO: Naviguer vers l'édition du profil
    console.log('Édition du profil...');
  }

  changePassword(): void {
    // TODO: Ouvrir modal de changement de mot de passe
    console.log('Changement de mot de passe...');
  }

  downloadData(): void {
    // TODO: Télécharger les données personnelles
    console.log('Téléchargement des données...');
  }
}
