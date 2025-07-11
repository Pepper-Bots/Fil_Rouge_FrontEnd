import {Component, inject, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {Dossier} from '../../models/dossier';
import {AuthService} from '../../services/auth.service';


@Component({
  selector: 'app-accueil',
  imports: [
    MatButtonModule,
    MatCardModule,
    ],
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.scss'
})
export class AccueilComponent implements OnInit {
  // titre = "Accueil"
  // compteur = 0
  //
  // onClic() {
  //   //console.log("coucou");
  //   this.compteur ++
  // }
  http = inject(HttpClient); // inject pour récupérer un service
  dossiers: Dossier[] = [];
  auth = inject(AuthService);

  // méthode qui se déclenche dès que le composant a fini d'etre initialisé
  ngOnInit() {
    this.http
      .get<Dossier[]>("http://localhost:8080/dossiers") // lien entre front & back
      .subscribe(dossiers => this.dossiers = dossiers) // on récupère la liste dossiers
  }

}
