import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { ModalsModule, WidgetsModule } from '../../_metronic/partials';
import { ReportsModule } from '../reports/reports.module';
import { CleanStatusWidgetComponent } from './widgets/clean-status-widget/clean-status-widget.component';
import { TranslateModule } from '@ngx-translate/core';
import { OccupacyAndIncomeWidgetComponent } from './widgets/occupacy-and-income-widget/occupacy-and-income-widget.component';
import { BadgeWidgetComponent } from './widgets/badge-widget/badge-widget.component';
import { FutureReservationsComponent } from './widgets/future-reservations/future-reservations.component';
import { CanceledReservationsComponent } from './widgets/canceled-reservations/canceled-reservations.component';
import { TemporalReservationsWidgetComponent } from './widgets/temporal-reservations-widget/temporal-reservations-widget.component';
import { AbandonReservationsWidgetComponent } from './widgets/abandon-reservations-widget/abandon-reservations-widget.component';
import { InHouseComponent } from '../reports/widgets/in-house/in-house.component';
import { ArrivalsComponent } from '../reports/widgets/arrivals/arrivals.component';
import { DeparturesComponent } from '../reports/widgets/departures/departures.component';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { LlegadasTableComponent } from '../reports/widgets/_helpers/llegadas-table/llegadas.table.component';
import { SalidasTableComponent } from '../reports/widgets/_helpers/salidas-table/salidas.table.component';
import { EnCasaTableComponent } from '../reports/widgets/_helpers/encasa-table/encasa.table.component';
import {MatTooltipModule} from '@angular/material/tooltip';

@NgModule({
  declarations: [DashboardComponent, CleanStatusWidgetComponent, OccupacyAndIncomeWidgetComponent, BadgeWidgetComponent, FutureReservationsComponent, CanceledReservationsComponent, TemporalReservationsWidgetComponent, AbandonReservationsWidgetComponent,
    ArrivalsComponent, DeparturesComponent, InHouseComponent, LlegadasTableComponent, SalidasTableComponent, EnCasaTableComponent
  ],
  imports: [
    TranslateModule,
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: DashboardComponent,
      }
    ]),
    WidgetsModule,
    ModalsModule,
    SharedModule
  ],
  exports:[
    LlegadasTableComponent
  ]
})
export class DashboardModule {}
