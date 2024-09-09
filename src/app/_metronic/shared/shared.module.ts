import {NgModule} from '@angular/core';
import {KeeniconComponent} from './keenicon/keenicon.component';
import {CommonModule, JsonPipe} from "@angular/common";
import { TranslateModule } from '@ngx-translate/core';
import { LoadingSpinnerComponent } from 'src/app/services/_helpers/loaderspinner/loaderspinner.component';
import { PaginatorComponent } from './paginator/paginator.component';
import { SortIconComponent } from './sort-icon/sort-icon.component';
import { AlertsComponent } from './alerts/alerts.component';
import { NgPagination } from './paginator/ng-pagination/ng-pagination.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { ScheduleModule, RecurrenceEditorModule, DayService, WeekService, WorkWeekService, MonthService, MonthAgendaService, TimelineMonthService } from '@syncfusion/ej2-angular-schedule'
import { InlineSpinnerComponent } from 'src/app/services/_helpers/inlineSpinner/inline-spinner.component';
import {MatCardModule} from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    KeeniconComponent,
    LoadingSpinnerComponent,
    PaginatorComponent,
    SortIconComponent,
    AlertsComponent,
    NgPagination,
    InlineSpinnerComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    InlineSVGModule,
    MatTabsModule,
    MatExpansionModule,
    MatIconModule,
    MatDatepickerModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatListModule,
    MatToolbarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatCheckboxModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatPaginatorModule,
    MatTableModule,
    MatRadioModule,
    MatInputModule,
    ScheduleModule,
    RecurrenceEditorModule,
    MatCardModule,
    MatButtonModule,
  ],
  exports: [
    KeeniconComponent,
    TranslateModule,
    LoadingSpinnerComponent,
    PaginatorComponent,
    SortIconComponent,
    AlertsComponent,
    MatRadioModule,
    InlineSVGModule,
    MatTabsModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatListModule,
    MatToolbarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSortModule,
    NgbModule,
    FormsModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatPaginatorModule,
    MatTableModule,
    MatInputModule,
    JsonPipe,
    MatDatepickerModule,
    MatNativeDateModule,
    ScheduleModule,
    RecurrenceEditorModule,
    InlineSpinnerComponent,
    MatCardModule,
    MatTooltipModule
  ],
  providers:[
    DayService,
    WeekService,
    WorkWeekService,
    MonthAgendaService,
    MonthService,
    TimelineMonthService
  ]
})
export class SharedModule {
}
