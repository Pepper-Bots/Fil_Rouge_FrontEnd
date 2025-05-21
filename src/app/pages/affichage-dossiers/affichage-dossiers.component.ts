import {Component, inject, OnInit} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import * as http from 'node:http';
import {HttpClient} from '@angular/common/http';
import {Dossier} from '../../models/dossier';

@Component({
  selector: 'app-affichage-dossiers',
  imports: [],
  templateUrl: './affichage-dossiers.component.html',
  styleUrl: './affichage-dossiers.component.scss'
})
export class AffichageDossiersComponent implements OnInit {

  http = inject(HttpClient)

  dossiers: Dossier[] = []

  ngOnInit() {
    this.http.get('http://localhost:8080/dossiers')
      .subscribe(dossiers => {})
  }

}

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

/**
 * @title Basic use of `<table mat-table>`
 */
@Component({
  selector: 'table-basic-example',
  styleUrl: 'table-basic-example.css',
  templateUrl: 'table-basic-example.html',
  imports: [MatTableModule],
})
export class TableBasicExample {
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = ELEMENT_DATA;
}
