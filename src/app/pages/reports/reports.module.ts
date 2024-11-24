import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag'
import { TranslateModule } from '@ngx-translate/core';
import { ProspectsComponent } from './prospects/prospects.component';
import { ReportsComponent } from './reports.component';
import { ReportsRoutingModule } from './reports-routing.module';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule, MatDateRangePicker } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ReservationsReportsComponent } from './reservations/reservations.component';
import { OutOfServiceComponent } from './out-of-service/out-of-service.component';
import { ArrivalsComponent } from './widgets/arrivals/arrivals.component';
import { ArrivalsReportComponent } from './arrivals/arrivals-report.component';
import { DynamicReportComponent } from './dinamyc-reports/dynamic-report.component';
export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'LL',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@NgModule({
  declarations: [
    ProspectsComponent,
    ReportsComponent,
    ReservationsReportsComponent,
    OutOfServiceComponent,
    ArrivalsReportComponent,
    DynamicReportComponent
  ],
  imports: [
    MatTableModule,
    TranslateModule,
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    RouterModule,
    ReportsRoutingModule,
    MatFormFieldModule,
    MatInputModule,    
    MatDatepickerModule,
    MatOptionModule,
    MatSelectModule,
    MatPaginatorModule,
    SharedModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-MX' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  
})
export class ReportsModule { }
