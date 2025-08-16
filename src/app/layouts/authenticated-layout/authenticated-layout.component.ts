import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-authenticated-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './authenticated-layout.component.html',
  styleUrls: ['./authenticated-layout.component.scss']
})
export class AuthenticatedLayoutComponent implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  currentUserRole: string = '';
  userFullName: string = '';

  private authService = inject(AuthService);
  private router = inject(Router);
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.loadUserRole();
    this.loadUserInfo();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadUserRole(): void {
    this.currentUserRole = this.authService.getUserRole() || 'STAGIAIRE';
    console.log('🎭 Rôle chargé dans layout:', this.currentUserRole);
  }

  private loadUserInfo(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userFullName = `${user.firstName} ${user.lastName}`;
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout(): void {
    console.log('🚪 Déconnexion depuis le layout');
    this.authService.logout();
  }

  // Méthodes utilitaires pour le template
  isAdmin(): boolean {
    return this.currentUserRole === 'ADMIN' || this.currentUserRole === 'SUPER_ADMIN';
  }

  isStagiaire(): boolean {
    return this.currentUserRole === 'STAGIAIRE';
  }

  isSuperAdmin(): boolean {
    return this.currentUserRole === 'SUPER_ADMIN';
  }

  navigateToDashboard(): void {
    if (this.isStagiaire()) {
      this.router.navigate(['/dashboard-stagiaire']);
    } else if (this.isAdmin()) {
      this.router.navigate(['/dashboard-admin']);
    }
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get userRole(): string {
    return this.authService.getUserRole() || '';
  }
}
