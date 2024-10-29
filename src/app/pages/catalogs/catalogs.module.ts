import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogsComponent } from './catalogs.component';
import { RoomsComponent } from './rooms/rooms.component';
import { CatalogsRoutingModule } from './catalogs-routing.module';
/**ANGULAR MATERIAL */
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { WidgetsModule } from 'src/app/widgets/widgets.module';
import { NewRoomComponent } from './rooms/components/new-room/new-room.component';
import { UploadFormComponent } from '../uploads/upload-form.component';
import { RatesComponent } from './rates/rates.component';
import { UploadDetailsComponent } from '../uploads/upload-details.component';
import { UploadListComponent } from '../uploads/upload-list.component';
import { SpecialRatesComponent } from './rates/special-rates/special-rates.component';
import { ExpressRatesComponent } from './rates/express-rates/express.rates.component';
import { ButtonAllModule, ButtonModule, CheckBoxAllModule, SwitchAllModule } from '@syncfusion/ej2-angular-buttons';
import { RecurrenceEditorAllModule, ScheduleAllModule } from '@syncfusion/ej2-angular-schedule';
import { DatePickerAllModule, TimePickerAllModule, DateTimePickerAllModule } from '@syncfusion/ej2-angular-calendars';
import { DropDownListAllModule, MultiSelectAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { NumericTextBoxAllModule, TextBoxAllModule, MaskedTextBoxModule, UploaderAllModule } from '@syncfusion/ej2-angular-inputs';
import { ToolbarAllModule, ContextMenuAllModule, TreeViewModule, AppBarModule } from '@syncfusion/ej2-angular-navigations';
import { ToastAllModule } from '@syncfusion/ej2-angular-notifications';
import { DropDownButtonAllModule } from '@syncfusion/ej2-angular-splitbuttons';
import { FareCalendarComponent } from './rates/fare-calendar/fare.calendar.component';
import { TempRatesComponent } from './rates/temp-rates/temp.rates.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';



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
    FareCalendarComponent,
    TempRatesComponent
  ],
  imports: [
    CommonModule,
    CatalogsRoutingModule,
    SharedModule,
    WidgetsModule,
    ButtonModule,
    // Include other modules that you are using here
    ScheduleAllModule, 
    RecurrenceEditorAllModule,   
    NumericTextBoxAllModule, 
    TextBoxAllModule, 
    DatePickerAllModule, 
    TimePickerAllModule, 
    DateTimePickerAllModule, 
    CheckBoxAllModule,   
    ToolbarAllModule, 
    DropDownListAllModule, 
    ContextMenuAllModule, 
    MaskedTextBoxModule, 
    UploaderAllModule, 
    MultiSelectAllModule,   
    TreeViewModule, 
    ButtonAllModule, 
    DropDownButtonAllModule, 
    SwitchAllModule,  
    ToastAllModule, 
    AppBarModule,
  ],
})
export class CatalogsModule { }
