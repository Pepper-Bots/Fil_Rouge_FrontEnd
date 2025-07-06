import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Dossier} from '../../models/dossier';
import {StatutDossier} from '../../models/statut-dossier';
import {Stagiaire} from '../../models/stagiaire';
import {Formation} from '../../models/formation';
import {MatFormField, MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {NgForOf, NgIf} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
  selector: 'app-edit-dossier',
  imports: [ReactiveFormsModule, MatFormFieldModule, FormsModule, MatFormField, MatButton, MatIcon, MatOption, MatSelect, MatInput, NgIf, NgForOf],
  templateUrl: './edit-dossier.component.html',
  styleUrl: './edit-dossier.component.scss'
})
export class EditDossierComponent implements OnInit {

  formBuilder = inject(FormBuilder);
  http = inject(HttpClient);
  activatedRoute = inject(ActivatedRoute);
  notification = inject(MatSnackBar);

  formulaire = this.formBuilder.group({
    codeDossier: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(2)]],
    statutDossier: [null as StatutDossier | null, Validators.required],
    stagiaire: [null as Stagiaire | null, Validators.required],
    formation: [null as Formation | null, Validators.required]
  });

  statuts: StatutDossier[] = [];
  stagiaires: Stagiaire[] = [];
  formations: Formation[] = [];
  dossierEdite: Dossier | null = null;

  statutColorMap: { [key: string]: string } = {
    'Complet': '#28a745',
    'En cours': '#ffc107',
    'Incomplet': '#dc3545'
  };

  getStatutColor(statut: StatutDossier | undefined): string {
    if (!statut) return '#ccc';
    return this.statutColorMap[statut.nomStatut] || '#ccc';
  }


  ngOnInit() {
    // Récupération des listes pour les selects
    this.http.get<StatutDossier[]>('http://localhost:8080/api/statuts-dossier').subscribe(res => this.statuts = res);
    this.http.get<Stagiaire[]>('http://localhost:8080/api/stagiaires').subscribe(res => this.stagiaires = res);
    this.http.get<Formation[]>('http://localhost:8080/api/formations').subscribe(res => this.formations = res);

    this.activatedRoute.params.subscribe(params => {
      if (params['id']) {
        this.http.get<Dossier>('http://localhost:8080/api/dossiers/dossier/' + params['id'])
          .subscribe(dossier => {
            this.formulaire.patchValue({
              codeDossier: dossier.codeDossier,
              statutDossier: dossier.statutDossier,
              stagiaire: dossier.stagiaire,
              formation: dossier.formation
            });
            this.dossierEdite = dossier;
          });
      }
    });
  }

  onSubmit() {
    if (this.formulaire.valid) {
      const data = this.formulaire.value;

      // DTO back : on ne transmet que l'id pour stagiaire et formation
      const dto = {
        ...data,
        stagiaire: { id: data.stagiaire?.id },
        formation: { id: data.formation?.id }
      };

      if (this.dossierEdite) {
        this.http
          .put(`http://localhost:8080/api/dossiers/dossier/${this.dossierEdite.id}`, dto)
          .subscribe(() => {
            this.notification.open("Le dossier a bien été modifié", "", {duration : 5000, verticalPosition: "top"});
          });
      } else {
        this.http
          .post('http://localhost:8080/api/dossiers/admin', dto)
          .subscribe(() => {
            this.notification.open("Le dossier a bien été ajouté", "", {duration : 5000, verticalPosition: "top"});
          });
      }
    }
  }

  compareId(o1: {id: number} | null, o2: {id: number} | null) {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }
}
