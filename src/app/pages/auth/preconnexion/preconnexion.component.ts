// preconnexion.component.ts
import { Component, inject } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-preconnexion',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './preconnexion.component.html',
  styleUrls: ['./preconnexion.component.scss']
})
export class PreconnexionComponent {
  private router = inject(Router);
  backgroundImage = './assets/img/img_accueil.jpg';
  logoSrc = './assets/logo/Logo_sans_fond.png';

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
