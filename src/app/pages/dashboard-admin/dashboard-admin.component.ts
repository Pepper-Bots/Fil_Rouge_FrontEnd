import { Component, OnInit } from '@angular/core';
import {DashboardAdminService} from '../../services/crud/dashboard-admin.service';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.scss']
})
export class DashboardAdminComponent implements OnInit {

  nbStagiaires = 0;
  nbFormations = 0;
  nbIntervenants = 0;
  nbDocsAttente = 0;

  inscriptionsEnAttente: any[] = [];
  docsAttente: any[] = [];

  loading = true;

  constructor(private dashboardService: DashboardAdminService) {}

  ngOnInit(): void {
    this.dashboardService.getAdminDashboard().subscribe(data => {
      this.nbStagiaires = data.nbStagiaires;
      this.nbFormations = data.nbFormations;
      this.nbIntervenants = data.nbIntervenants;
      this.nbDocsAttente = data.nbDocsAttente;
      this.inscriptionsEnAttente = data.inscriptionsEnAttente;
      this.docsAttente = data.docsAttente;
      this.loading = false;
    });
  }
}
