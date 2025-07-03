import {Component, inject, OnInit} from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {MatOption, MatSelect, MatSelectModule} from '@angular/material/select';
import {ActivatedRoute} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Dossier, EtatDossiers} from '../../models/dossier';

// ReactiveFormsModule utilisé pour valider le formulaire

interface EtatDossier {
}

// FormsModule bloque le formulaire pour ne pas recharger la page
@Component({
  selector: 'app-edit-dossier',
  imports: [MatInputModule, MatButtonModule, MatIconModule,
    MatSelectModule, ReactiveFormsModule, FormsModule, MatSelect, MatOption],
  templateUrl: './edit-dossier.component.html',
  styleUrl: './edit-dossier.component.scss'
})
export class EditDossierComponent implements OnInit {

  formBuilder = inject(FormBuilder);
  http = inject(HttpClient);
  activatedRoute = inject(ActivatedRoute);

  formulaire = this.formBuilder.group({
    nom: ['Nouveau dossier', [Validators.required, Validators.maxLength(20), Validators.minLength(3)]],
    // codeArticle: ['777', [Validators.required]],
    description: ['Une description', []],
    // prix: [0.10, [Validators.required, Validators.min(0.1)]],
    etat: [{id: 1}],
    // etats: [[] as Etat[]],
  });

  // TODO - Voir attributs de Dossier dans le back -> comment c'était géré dans le back du cours ? classe état ?
  etatDossiers: EtatDossiers[] = []
  // etiquettes: Etiquette[] = [];
  dossierEdite: Dossier | null = null;
  notification = inject(MatSnackBar);
  private etats: EtatDossier[] | undefined;


  ngOnInit() {

    this.activatedRoute.params
      .subscribe(parametres => {

        // Si c'est une édition
        if (parametres['id']) {
          this.http
            .get<Dossier>('http://localhost:8080/dossier/' + parametres['id'])
            .subscribe(dossier => {
              this.formulaire.patchValue(dossier)
              this.dossierEdite = dossier;
            })
        }
      })

    this.http
      .get<EtatDossier[]>(`http://localhost:8080/etats`)
      .subscribe(etats => this.etats = etats)

    // this.http
    //   .get<Etiquette[]>(`http://localhost:8080/etiquettes`)
    //   .subscribe(etiquettes => this.etiquettes = etiquettes)

  }


  onAjoutProduct() {

    if (this.formulaire.valid) {
      // console.log(this.formulaire.value);

      // Pour éditer produit
      if (this.dossierEdite) {

        // TODO notification 'dossier modifié' ne s'affiche pas -> A corriger
        this.http
          .put('http://localhost:8080/product' + this.dossierEdite.id, this.formulaire.value) // TODO chercher différence méthode post & put -> laquelle mieux ici ?
          .subscribe(resultat => {
            this.notification.open("Le dossier a bien été modifié", "", {duration : 5000, verticalPosition: "top"})
          })

      } else {

        this.http
          .post('http://localhost:8080/dossier', this.formulaire.value)
          .subscribe(resultat => {
            this.notification.open("Le dossier a bien été ajouté", "", {duration : 5000, verticalPosition: "top"})
          })
      }
    }

  }

  compareId(o1: {id: number}, o2: {id: number}) {

    return o1.id === o2.id;
  }

}
