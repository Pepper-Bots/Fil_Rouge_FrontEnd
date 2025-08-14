// src/app/services/crud/formation.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Formation } from '../../models/formation';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FormationService {

  private readonly API_BASE_URL = environment.serverUrl + 'api';

  constructor(private http: HttpClient) {}

  /**
   * Headers HTTP avec authentification
   */
  private getHttpHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwt');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  /**
   * Récupère toutes les formations disponibles
   */
  getFormations(): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.API_BASE_URL}/formations`, {
      headers: this.getHttpHeaders()
    });
  }

  /**
   * Récupère une formation par son ID
   */
  getFormationById(id: number): Observable<Formation> {
    return this.http.get<Formation>(`${this.API_BASE_URL}/formations/${id}`, {
      headers: this.getHttpHeaders()
    });
  }

  /**
   * Récupère la description détaillée d'une formation
   */
  getDescriptionDetaillee(formationId: number): string {
    const descriptions: { [key: number]: string } = {
      1: `Formation intensive axée sur les technologies front-end modernes. Vous apprendrez à créer des interfaces utilisateur interactives et responsives en utilisant HTML5, CSS3, JavaScript ES6+ et React.
      Cette formation couvre également les outils de développement comme Git, Webpack, et les bonnes pratiques de développement web.
      Idéale pour débuter dans le développement web ou se spécialiser côté client.
      Durée : 500 heures sur 4 mois. Niveau requis : Bac+2 minimum.
      À l'issue de cette formation, vous serez capable de développer des applications web modernes et de collaborer efficacement en équipe.`,

      2: `Formation spécialisée dans le développement côté serveur avec Node.js et Express. Vous maîtriserez la création d'APIs REST, la gestion des bases de données (MySQL, MongoDB) et l'authentification.
      Le programme inclut l'architecture logicielle, les tests unitaires, la sécurité des applications et le déploiement sur le cloud.
      Cette formation est parfaite pour ceux qui souhaitent devenir développeurs back-end ou full-stack.
      Durée : 500 heures sur 4 mois. Niveau requis : Bac+2 avec bases en programmation.
      Débouchés : Développeur back-end, Architecte logiciel, DevOps junior.`,

      3: `Formation complète alliant front-end et back-end pour devenir développeur polyvalent. Vous développerez des applications web de A à Z en utilisant React, Node.js, et les bases de données relationnelles.
      Le programme couvre l'intégration continue, les méthodologies agiles, et la gestion de projets techniques complexes.
      Idéale pour une reconversion professionnelle vers le développement web ou pour approfondir ses compétences.
      Durée : 500 heures sur 6 mois. Niveau requis : Bac+3 ou expérience professionnelle équivalente.
      Certification professionnelle incluse. Taux d'insertion professionnelle : 95%.`,

      4: `Formation dédiée à la sécurité des infrastructures informatiques. Vous apprendrez à configurer des firewalls, analyser les vulnérabilités réseau et mettre en place des solutions de monitoring.
      Le programme inclut la cryptographie, les protocoles de sécurité, la détection d'intrusions et la réponse aux incidents.
      Formation pratique avec laboratoires virtuels et études de cas réels d'entreprises.
      Durée : 500 heures sur 4 mois. Niveau requis : Bac+3 en informatique ou expérience système/réseau.
      Débouchés : Administrateur sécurité, Analyste SOC, Consultant en cybersécurité.`,

      5: `Formation avancée aux techniques d'intrusion éthique et d'audit de sécurité. Vous maîtriserez les outils de pentest, l'analyse de vulnérabilités et la rédaction de rapports d'audit.
      Le programme couvre le pentest web, réseau, mobile et l'ingénierie sociale dans un cadre légal et éthique strict.
      Formation certifiante avec mise en situation sur plateformes dédiées et environnements contrôlés.
      Durée : 500 heures sur 5 mois. Niveau requis : Bac+5 ou forte expérience en sécurité informatique.
      Certification éthique obligatoire. Débouchés : Pentester, Consultant sécurité, Expert cybersécurité.`,

      6: `Formation spécialisée dans l'écosystème Java Enterprise avec Spring Boot. Vous développerez des applications web robustes, sécurisées et scalables pour l'entreprise.
      Le programme inclut Spring Security, JPA/Hibernate, les microservices et l'intégration avec des bases de données complexes.
      Formation orientée projets avec développement d'applications métier complètes.
      Durée : 500 heures sur 5 mois. Niveau requis : Bac+2 avec bases solides en programmation orientée objet.
      Partenariat avec des entreprises locales pour stages et projets réels.`,

      7: `Formation experte en cyberdéfense et gestion de centre opérationnel de sécurité (SOC). Vous apprendrez à détecter, analyser et répondre aux cyberattaques en temps réel.
      Le programme couvre les SIEM, l'analyse forensique, la threat intelligence et la coordination des équipes de sécurité.
      Formation immersive avec simulations d'attaques et gestion de crise en environnement réaliste.
      Durée : 500 heures sur 6 mois. Niveau requis : Bac+5 ou expérience significative en cybersécurité.
      Certification ANSSI possible. Débouchés : Responsable SOC, Analyste cybersécurité, RSSI adjoint.`,

      8: `Formation pratique au développement web avec PHP et le framework Laravel. Vous créerez des applications web dynamiques, des APIs et des systèmes de gestion de contenu.
      Le programme inclut Eloquent ORM, l'authentification, les tests automatisés et les bonnes pratiques de développement PHP moderne.
      Formation projet avec développement d'une application e-commerce complète.
      Durée : 500 heures sur 4 mois. Niveau requis : Bac+2 avec notions de programmation web.
      Laravel étant très demandé, excellent taux d'employabilité dans les PME et startups.`,

      9: `Formation spécialisée dans la sécurisation des applications web. Vous identifierez et corrigerez les vulnérabilités OWASP, implémenterez des mécanismes de protection robustes.
      Le programme couvre l'injection SQL, XSS, CSRF, l'authentification sécurisée et les audits de code.
      Formation hands-on avec analyse de vraies applications vulnérables et développement sécurisé.
      Durée : 500 heures sur 5 mois. Niveau requis : Bac+5 ou expérience en développement web et sécurité.
      Certification sécurité incluse. Profil très recherché par les entreprises sensibles à la cybersécurité.`,

      10: `Formation d'introduction complète à la cybersécurité pour débutants. Vous découvrirez les fondamentaux de la sécurité informatique, les principales menaces et les bonnes pratiques.
      Le programme couvre la sensibilisation sécurité, la protection des données, les bases du réseau et de la cryptographie.
      Formation accessible sans prérequis technique, idéale pour une première approche ou une sensibilisation métier.
      Durée : 500 heures sur 3 mois. Niveau requis : Bac+2 tous domaines, motivation pour la cybersécurité.
      Excellent tremplin vers des formations plus spécialisées ou des postes de sensibilisation sécurité.`
    };

    return descriptions[formationId] || 'Description non disponible pour cette formation.';
  }

  /**
   * Récupère le niveau d'une formation basé sur son ID
   */
  getNiveauFormation(formationId: number): string {
    // Basé sur vos données : niveaux A, B, C
    if (formationId <= 2 || formationId === 8 || formationId === 10) {
      return 'A (Bac+2)';
    } else if (formationId <= 5) {
      return 'B (Bac+3)';
    } else {
      return 'C (Bac+5)';
    }
  }

  /**
   * Récupère la durée en mois d'une formation
   */
  getDureeFormation(formationId: number): number {
    const durees: { [key: number]: number } = {
      1: 4, 2: 4, 3: 6, 4: 4, 5: 5,
      6: 5, 7: 6, 8: 4, 9: 5, 10: 3
    };
    return durees[formationId] || 4;
  }
}
