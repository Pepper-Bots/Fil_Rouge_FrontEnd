import { Component } from '@angular/core';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-evenement-list',
  imports: [
    MatProgressSpinner
  ],
  templateUrl: './evenement-list.component.html',
  styleUrl: './evenement-list.component.scss'
})
export class EvenementListComponent {

}
