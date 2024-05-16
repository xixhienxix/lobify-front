import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { CalendarComponent } from './calendar.component';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { HeaderComponent } from './components/header/header.component';
import { ContentComponent } from './components/content/content.component';
import { FooterComponent } from './components/footer/footer.component';
import { BryntumSchedulerModule } from '@bryntum/scheduler-angular'; 
import { CheckBoxAllModule, ButtonAllModule, SwitchAllModule } from '@syncfusion/ej2-angular-buttons';
import { DatePickerAllModule, TimePickerAllModule, DateTimePickerAllModule } from '@syncfusion/ej2-angular-calendars';
import { DropDownListAllModule, MultiSelectAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { NumericTextBoxAllModule, TextBoxAllModule, MaskedTextBoxModule, UploaderAllModule } from '@syncfusion/ej2-angular-inputs';
import { ToolbarAllModule, ContextMenuAllModule, TreeViewModule, AppBarModule } from '@syncfusion/ej2-angular-navigations';
import { ToastAllModule } from '@syncfusion/ej2-angular-notifications';
import { ScheduleAllModule, RecurrenceEditorAllModule } from '@syncfusion/ej2-angular-schedule';
import { DropDownButtonAllModule } from '@syncfusion/ej2-angular-splitbuttons';
import { ReactiveFormsModule } from '@angular/forms';
import { NvaReservaComponent } from './components/nva-reserva/nva-reserva.component';
import { NvaReservationTemplateComponent } from './components/content/templates/nva-reservation-template/nva-reservation-template.component';


@NgModule({
  declarations: [CalendarComponent, HeaderComponent, ContentComponent, FooterComponent, NvaReservaComponent, NvaReservationTemplateComponent],
  imports: [
    TranslateModule,
    CommonModule,
    SharedModule,
    BryntumSchedulerModule,
    ReactiveFormsModule,
    ScheduleAllModule, RecurrenceEditorAllModule,   
    NumericTextBoxAllModule, TextBoxAllModule, DatePickerAllModule, 
    TimePickerAllModule, DateTimePickerAllModule, CheckBoxAllModule,   
    ToolbarAllModule, DropDownListAllModule, ContextMenuAllModule, MaskedTextBoxModule, 
    UploaderAllModule, MultiSelectAllModule,   TreeViewModule, ButtonAllModule, 
    DropDownButtonAllModule, SwitchAllModule,  ToastAllModule, AppBarModule,

    RouterModule.forChild([
      {
        path: '',
        component: CalendarComponent,
      }
    ]),
  ]
})
export class CalendarModule { }
