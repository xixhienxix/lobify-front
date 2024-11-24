// reports-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { OutOfServiceComponent } from './out-of-service/out-of-service.component';
import { DynamicReportComponent } from './dinamyc-reports/dynamic-report.component';

const routes: Routes = [
  {
    path: '', // Base route for /reports
    component: ReportsComponent,
    children: [
      { path: 'bloqueos', component: OutOfServiceComponent },
      { path: ':reportType', component: DynamicReportComponent },

    ],
  },
  // {
  //   path: ':reportType', // Dynamic route for reports/:reportType
  //   component: DynamicReportComponent,
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}