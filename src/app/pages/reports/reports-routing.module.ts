// reports-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { ProspectsComponent } from './prospects/prospects.component'; // Path to your component
import { ReservationsReportsComponent } from './reservations/reservations.component';

const routes: Routes = [
  {
    path: '',
    component: ReportsComponent, // The base route (reports)
    children: [
      { path: 'prospects', component: ProspectsComponent }, // reports/prospects route
      { path: 'reservations', component: ReservationsReportsComponent }, // reports/prospects route
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}