import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { CalendarComponent } from './calendar.component';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { HeaderComponent } from './components/header/header.component';
import { ContentComponent } from './components/content/content.component';
import { FooterComponent } from './components/footer/footer.component';
import { CheckBoxAllModule, ButtonAllModule, SwitchAllModule } from '@syncfusion/ej2-angular-buttons';
import { DatePickerAllModule, TimePickerAllModule, DateTimePickerAllModule } from '@syncfusion/ej2-angular-calendars';
import { DropDownListAllModule, MultiSelectAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { NumericTextBoxAllModule, TextBoxAllModule, MaskedTextBoxModule, UploaderAllModule } from '@syncfusion/ej2-angular-inputs';
import { ToolbarAllModule, ContextMenuAllModule, TreeViewModule, AppBarModule, MenuModule } from '@syncfusion/ej2-angular-navigations';
import { ToastAllModule } from '@syncfusion/ej2-angular-notifications';
import { ScheduleAllModule, RecurrenceEditorAllModule } from '@syncfusion/ej2-angular-schedule';
import { DropDownButtonAllModule } from '@syncfusion/ej2-angular-splitbuttons';
import { ReactiveFormsModule } from '@angular/forms';
import { WarningComponent } from './_helpers/warning.prompt.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import { EditReservaComponent } from './components/content/edit-reserva/edit-reserva.component';
import { ReservasComponent } from './components/content/edit-reserva/components/reservas/reservas.component';
import { HuespedComponent } from './components/content/edit-reserva/components/huesped/huesped.component';
import { PromesasComponent } from './components/content/edit-reserva/components/promesas/promesas.component';
import { DetalleComponent } from './components/content/edit-reserva/components/transacciones/components/detalle.component';
import { TransaccionesComponent } from './components/content/edit-reserva/components/transacciones/transacciones.component';
import { EdoCuentaComponent } from './components/content/edit-reserva/components/edoCuenta/edoCuenta.component';
import { SaldoCuentaComponent } from './components/content/edit-reserva/components/edoCuenta/components/saldar.cuenta.component';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { AjustesComponent } from './components/content/edit-reserva/components/transacciones/components/ajustes/ajustes.component';
import { ReservationActionsComponent } from './components/content/edit-reserva/_helpers/action-buttons.component';
import { ModificaReservaComponent } from './components/content/edit-reserva/components/modifica/modifica.reserva.component';
import { MatMomentDateModule, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

// Optionally define your date format
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
    CalendarComponent, 
    HeaderComponent, 
    ContentComponent, 
    FooterComponent, 
    WarningComponent,
    EditReservaComponent,
    ReservasComponent,
    HuespedComponent,
    PromesasComponent,
    DetalleComponent,
    TransaccionesComponent,
    EdoCuentaComponent,
    SaldoCuentaComponent,
    AjustesComponent,
    ReservationActionsComponent,
    ModificaReservaComponent
  ],
  imports: [
    TranslateModule,
    MatMomentDateModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    MatButtonModule, 
    MatMenuModule, 
    MatIconModule,
    MatSelectModule,
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
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-MX' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
})
export class CalendarModule { }
