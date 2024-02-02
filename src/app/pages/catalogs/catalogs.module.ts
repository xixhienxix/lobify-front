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



@NgModule({
  declarations: [
    CatalogsComponent,
    RoomsComponent,
    NewRoomComponent,
    UploadFormComponent
  ],
  imports: [
    CommonModule,
    CatalogsRoutingModule,
    MatTableModule,
    SharedModule,
    WidgetsModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatCheckboxModule
  ]
})
export class CatalogsModule { }
