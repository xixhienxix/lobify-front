import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArrivalsComponent } from './widgets/arrivals/arrivals.component';
import { DeparturesComponent } from './widgets/departures/departures.component';
import { InHouseComponent } from './widgets/in-house/in-house.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag'
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [],
  imports: [
    TranslateModule,
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule
  ],
})
export class ReportsModule { }
