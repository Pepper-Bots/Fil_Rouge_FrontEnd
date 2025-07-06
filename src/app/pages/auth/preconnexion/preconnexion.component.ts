// preconnexion.component.ts
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-preconnexion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preconnexion.component.html',
  styleUrls: ['./preconnexion.component.scss']
})
export class PreconnexionComponent {
  private router = inject(Router);

  /**
   * Navigate to connection page with user type parameter
   * @param type - 'stagiaire' or 'admin'
   */
  navigateToConnexion(type: 'stagiaire' | 'admin') {
    this.router.navigate(['/connexion'], {
      queryParams: { type: type }
    });
  }
}
