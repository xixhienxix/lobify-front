import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogsComponent } from './catalogs.component';
import { RoomsComponent } from './rooms/rooms.component';
import { CatalogsRoutingModule } from './catalogs-routing.module';
/**ANGULAR MATERIAL */
import {MatTableModule} from '@angular/material/table';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { WidgetsModule } from 'src/app/widgets/widgets.module';
import { NewRoomComponent } from './rooms/components/new-room/new-room.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatPaginatorModule} from '@angular/material/paginator';
import { ReactiveFormsModule } from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { UploadFormComponent } from '../uploads/upload-form.component';
import { RatesComponent } from './rates/rates.component';
import { UploadDetailsComponent } from '../uploads/upload-details.component';
import { UploadListComponent } from '../uploads/upload-list.component';
import { SpecialRatesComponent } from './rates/special-rates/special-rates.component';
import { ExpressRatesComponent } from './rates/express-rates/express.rates.component';
import { EditExpressRateComponent } from './rates/express-rates/edit-express-rate/edit-express-rate.component';
import { ButtonAllModule, ButtonModule, CheckBoxAllModule, SwitchAllModule } from '@syncfusion/ej2-angular-buttons';
import { BryntumSchedulerModule } from '@bryntum/scheduler-angular'; 
import { RecurrenceEditorAllModule, ScheduleAllModule } from '@syncfusion/ej2-angular-schedule';
import { DatePickerAllModule, TimePickerAllModule, DateTimePickerAllModule } from '@syncfusion/ej2-angular-calendars';
import { DropDownListAllModule, MultiSelectAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { NumericTextBoxAllModule, TextBoxAllModule, MaskedTextBoxModule, UploaderAllModule } from '@syncfusion/ej2-angular-inputs';
import { ToolbarAllModule, ContextMenuAllModule, TreeViewModule, AppBarModule } from '@syncfusion/ej2-angular-navigations';
import { ToastAllModule } from '@syncfusion/ej2-angular-notifications';
import { DropDownButtonAllModule } from '@syncfusion/ej2-angular-splitbuttons';
import { FareCalendarComponent } from './rates/fare-calendar/fare.calendar.component';



@NgModule({
  declarations: [
    CatalogsComponent,
    RoomsComponent,
    NewRoomComponent,
    UploadFormComponent,
    RatesComponent,
    UploadDetailsComponent,
    UploadListComponent,
    UploadFormComponent,
    SpecialRatesComponent,
    ExpressRatesComponent,
    EditExpressRateComponent,
    FareCalendarComponent
  ],
  imports: [
    CommonModule,
    CatalogsRoutingModule,
    SharedModule,
    WidgetsModule,
    ButtonModule,
    BryntumSchedulerModule,
    ScheduleAllModule, RecurrenceEditorAllModule,   
    NumericTextBoxAllModule, TextBoxAllModule, DatePickerAllModule, 
    TimePickerAllModule, DateTimePickerAllModule, CheckBoxAllModule,   
    ToolbarAllModule, DropDownListAllModule, ContextMenuAllModule, MaskedTextBoxModule, 
    UploaderAllModule, MultiSelectAllModule,   TreeViewModule, ButtonAllModule, 
    DropDownButtonAllModule, SwitchAllModule,  ToastAllModule, AppBarModule,
  ]
})
export class CatalogsModule { }
