import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn } from '@angular/common/http';

import { jwtInterceptor } from './jwt.interceptor';

describe('jwtInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => jwtInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });
});



// Pourquoi ce fichier est important
//
// 1 Assurance qualité : Ce fichier vous permet de tester automatiquement que votre intercepteur JWT fonctionne correctement.
//
// 2 Tests de régression : À mesure que vous développez votre application, ces tests vous aideront à détecter si des changements cassent le fonctionnement de l'intercepteur.
//
// 3 Extensibilité des tests : Pour l'instant, il n'y a qu'un seul test basique, mais vous pourriez ajouter d'autres tests pour vérifier des comportements spécifiques :
//
// - Vérifier que l'intercepteur ajoute correctement le token JWT aux requêtes
// - Tester son comportement lorsqu'aucun token n'est disponible
// - Vérifier les cas d'erreur
//
//
//
// Ce fichier a probablement été généré automatiquement avec la commande Angular CLI qui a créé l'intercepteur. ' +
// 'C'est une bonne pratique de développement de maintenir ces tests à jour et d'ajouter des cas de test supplémentaires pour couvrir toutes les fonctionnalités de l'intercepteur.
