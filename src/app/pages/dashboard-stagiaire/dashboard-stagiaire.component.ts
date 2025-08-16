import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { EvenementDeclarationComponent } from './evenement-declaration/evenement-declaration.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatBadge } from '@angular/material/badge';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Subscription } from 'rxjs';

import {
  DashboardStagiaireService,
  StagiaireProfile,
  DossierInscription,
  NotificationStagiaire,
  EvenementAbsence,
  StatsStagiaire
} from '../../services/crud/dashboard-stagiaire.service';

@Component({
  selector: 'app-dashboard-stagiaire',
  imports: [
    EvenementDeclarationComponent,
    CommonModule,
    MatIcon,
    MatButton,
    MatCardContent,
    MatCard,
    MatIconButton,
    MatBadge,
    MatProgressBar
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './dashboard-stagiaire.component.html',
  styleUrls: ['./dashboard-stagiaire.component.scss']
})
export class DashboardStagiaireComponent implements OnInit, OnDestroy {

  // ==================== ÉTAT DU COMPOSANT ====================
  isPanelOpen = false;
  isLoading = true;

  // Données du stagiaire
  profile: StagiaireProfile | null = null;
  dossier: DossierInscription | null = null;
  notifications: NotificationStagiaire[] = [];
  evenements: EvenementAbsence[] = [];
  stats: StatsStagiaire | null = null;

  // Souscriptions pour éviter les fuites mémoire
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private dashboardService: DashboardStagiaireService
  ) {}

  // ==================== CYCLE DE VIE ====================

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    // Nettoyer les souscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ==================== CHARGEMENT DES DONNÉES ====================

  // À ajouter dans votre composant
  isSidebarOpen = false;

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  /**
   * 🔄 Charge toutes les données du dashboard
   */
  private loadDashboardData(): void {
    this.isLoading = true;

    // Souscriptions aux observables du service
    const profileSub = this.dashboardService.profile$.subscribe(
      profile => this.profile = profile
    );

    const dossierSub = this.dashboardService.dossier$.subscribe(
      dossier => this.dossier = dossier
    );

    const notificationsSub = this.dashboardService.notifications$.subscribe(
      notifications => this.notifications = notifications
    );

    const evenementsSub = this.dashboardService.evenements$.subscribe(
      evenements => this.evenements = evenements
    );

    const statsSub = this.dashboardService.stats$.subscribe(
      stats => this.stats = stats
    );

    // Ajouter aux souscriptions
    this.subscriptions.push(
      profileSub,
      dossierSub,
      notificationsSub,
      evenementsSub,
      statsSub
    );

    // Charger les données initiales
    const refreshSub = this.dashboardService.rafraichirToutesDonnees().subscribe({
      next: (success) => {
        console.log('✅ Données du dashboard chargées avec succès');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement:', error);
        this.isLoading = false;
        // Afficher une notification d'erreur si nécessaire
      }
    });

    this.subscriptions.push(refreshSub);
  }

  /**
   * 🔄 Actualise manuellement les données
   */
  refreshDashboard(): void {
    this.loadDashboardData();
  }

  // ==================== GESTION DES PANNEAUX ====================

  /**
   * 🔀 Bascule l'affichage du panneau latéral
   */
  togglePanel(): void {
    this.isPanelOpen = !this.isPanelOpen;
  }

  /**
   * ❌ Ferme le panneau latéral
   */
  closePanel(): void {
    this.isPanelOpen = false;
  }

  // ==================== NAVIGATION ====================

  /**
   * 📄 Navigation vers l'upload de documents
   */
  navigateToDocumentUpload(): void {
    this.router.navigate(['/document-upload']);
  }

  /**
   * 📂 Navigation vers la liste des documents
   */
  navigateToMyDocuments(): void {
    this.router.navigate(['/mes-documents']);
  }

  /**
   * 👤 Navigation vers le profil
   */
  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  /**
   * 📅 Navigation vers le calendrier
   */
  navigateToCalendar(): void {
    this.router.navigate(['/calendrier']);
  }

  /**
   * 📋 Navigation vers le règlement intérieur
   */
  navigateToReglement(): void {
    this.router.navigate(['/reglement']);
  }

  /**
   * 📞 Navigation vers les contacts
   */
  navigateToContacts(): void {
    this.router.navigate(['/contacts']);
  }

  // ==================== ACTIONS SUR LES DONNÉES ====================

  /**
   * ✅ Marque une notification comme lue
   */
  marquerNotificationLue(notificationId: number): void {
    this.dashboardService.marquerNotificationLue(notificationId).subscribe({
      next: () => {
        console.log(`Notification ${notificationId} marquée comme lue`);
      },
      error: (error) => {
        console.error('Erreur lors du marquage de la notification:', error);
      }
    });
  }

  /**
   * 🔔 Gère le clic sur les notifications
   */
  onNotificationClick(notification: NotificationStagiaire): void {
    if (!notification.lu) {
      this.marquerNotificationLue(notification.id);
    }

    // Naviguer vers la page liée si présent
    if (notification.lien) {
      this.router.navigate([notification.lien]);
    }
  }

  // ==================== GETTERS POUR LE TEMPLATE ====================

  /**
   * 🔔 Nombre de notifications non lues
   */
  get nombreNotificationsNonLues(): number {
    return this.dashboardService.getNombreNotificationsNonLues();
  }

  /**
   * ⚠️ Vérifie si il y a des alertes actives
   */
  get hasAlerteActive(): boolean {
    return this.dashboardService.hasAlerteActive();
  }

  /**
   * 📈 Progression du dossier
   */
  get progressionDossier(): number {
    return this.dashboardService.getProgressionDossier();
  }

  /**
   * 🎯 Message de statut du dossier
   */
  get statutDossierMessage(): string {
    if (!this.dossier) return 'Chargement...';

    switch (this.dossier.statutDossier) {
      case 'INCOMPLET':
        return `Il manque ${this.dossier.documentsManquants.length} document(s) à votre dossier`;
      case 'COMPLET':
        return 'Dossier complet - En attente de validation';
      case 'EN_COURS':
        return 'Dossier en cours de traitement';
      case 'VALIDE':
        return 'Dossier validé - Inscription confirmée';
      default:
        return 'Statut inconnu';
    }
  }

  /**
   * 🎯 Couleur du badge selon le statut
   */
  get statutDossierColor(): string {
    if (!this.dossier) return 'primary';

    switch (this.dossier.statutDossier) {
      case 'INCOMPLET':
        return 'warn';
      case 'COMPLET':
        return 'accent';
      case 'EN_COURS':
        return 'primary';
      case 'VALIDE':
        return 'primary';
      default:
        return 'primary';
    }
  }

  /**
   * 📊 Retards à justifier
   */
  get retardsAJustifier(): number {
    return this.evenements.filter(e =>
      e.type === 'RETARD' && e.statut === 'EN_ATTENTE'
    ).length;
  }

  /**
   * 📊 Message pour la carte absences/retards
   */
  get absenceRetardMessage(): string {
    const retards = this.retardsAJustifier;
    if (retards > 0) {
      return `${retards} retard${retards > 1 ? 's' : ''} à justifier`;
    }
    return 'Aucun retard à justifier';
  }

  /**
   * 🎓 Nom de la formation courte
   */
  get formationNomCourt(): string {
    if (!this.profile?.formation) return 'Aucune formation';
    const nom = this.profile.formation.nom;
    // Raccourcir le nom si trop long
    return nom.length > 25 ? nom.substring(0, 25) + '...' : nom;
  }

  /**
   * 📅 Prochain cours formaté
   */
  get prochainCoursFormate(): string {
    const prochainCours = this.profile?.formation?.prochainCours;
    if (!prochainCours) return 'Aucun cours programmé';

    const date = new Date(prochainCours.date);
    const aujourdhui = new Date();
    const demain = new Date(aujourdhui);
    demain.setDate(demain.getDate() + 1);

    if (date.toDateString() === aujourdhui.toDateString()) {
      return `Aujourd'hui - ${prochainCours.matiere}`;
    } else if (date.toDateString() === demain.toDateString()) {
      return `Demain - ${prochainCours.matiere}`;
    } else {
      return `${date.toLocaleDateString('fr-FR')} - ${prochainCours.matiere}`;
    }
  }

  /**
   * 📈 Classe CSS pour la barre de progression du dossier
   */
  get progressionDossierClass(): string {
    const progression = this.progressionDossier;
    if (progression < 30) return 'progress-low';
    if (progression < 70) return 'progress-medium';
    return 'progress-high';
  }

  /**
   * ⚠️ Niveau d'alerte pour les absences/retards
   */
  get niveauAlerteAbsence(): string {
    if (!this.stats) return 'normal';

    const pourcentageRetards = (this.stats.totalRetards / this.stats.seuilRetards) * 100;
    const pourcentageAbsences = (this.stats.totalAbsences / this.stats.seuilAbsences) * 100;

    const maxPourcentage = Math.max(pourcentageRetards, pourcentageAbsences);

    if (maxPourcentage >= 80) return 'critique';
    if (maxPourcentage >= 60) return 'attention';
    return 'normal';
  }

  /**
   * 🎨 Classe CSS selon le type de notification
   */
  getNotificationClass(type: string): string {
    switch (type) {
      case 'WARNING': return 'orange-card';
      case 'SUCCESS': return 'green-card';
      case 'ERROR': return 'red-card';
      case 'INFO':
      default: return 'blue-card';
    }
  }

  /**
   * 🎨 Icône selon le type de notification
   */
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'WARNING': return 'warning';
      case 'SUCCESS': return 'check_circle';
      case 'ERROR': return 'error';
      case 'INFO':
      default: return 'info';
    }
  }

  // ==================== ÉVÉNEMENTS DE DÉCLARATION ====================

  /**
   * 📝 Gère la soumission d'un événement depuis le panel latéral
   */
  onEvenementDeclare(evenement: any): void {
    this.dashboardService.declarerEvenement(evenement).subscribe({
      next: () => {
        console.log('✅ Événement déclaré avec succès');
        this.closePanel();
        // Actualiser les données
        this.dashboardService.getEvenements().subscribe();
        this.dashboardService.getStats().subscribe();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la déclaration:', error);
        // Afficher un message d'erreur à l'utilisateur
      }
    });
  }

  // ==================== MÉTHODES UTILITAIRES ====================

  /**
   * 📅 Formate une date en français
   */
  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * ⏰ Formate une date avec l'heure
   */
  formatDateTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * 📊 Retourne le pourcentage formaté
   */
  formatPourcentage(valeur: number): string {
    return `${Math.round(valeur)}%`;
  }

  /**
   * 🔍 Debug - Affiche les données dans la console (développement uniquement)
   */
  debugDashboard(): void {
    if (!(window as any).environment?.production) {
      console.group('🔍 Debug Dashboard Stagiaire');
      console.log('Profile:', this.profile);
      console.log('Dossier:', this.dossier);
      console.log('Notifications:', this.notifications);
      console.log('Événements:', this.evenements);
      console.log('Stats:', this.stats);
      console.groupEnd();
    }
  }
}
