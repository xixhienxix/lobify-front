import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogsComponent } from './catalogs.component';
import { RoomsComponent } from './rooms/rooms.component';
import { CatalogsRoutingModule } from './catalogs-routing.module';
/**ANGULAR MATERIAL */
import {MatTableModule} from '@angular/material/table';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { WidgetsModule } from 'src/app/widgets/widgets.module';
import { InlineSVGModule } from 'ng-inline-svg-2/lib_commonjs/inline-svg.module';
import { NewRoomComponent } from './rooms/components/new-room/new-room.component';



@NgModule({
  declarations: [
    CatalogsComponent,
    RoomsComponent,
    NewRoomComponent
  ],
  imports: [
    CommonModule,
    CatalogsRoutingModule,
    MatTableModule,
    SharedModule,
    WidgetsModule,
    InlineSVGModule
  ]
})
export class CatalogsModule { }
