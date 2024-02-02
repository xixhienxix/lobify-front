import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogsComponent } from './catalogs.component';
import { RoomsComponent } from './rooms/rooms.component';
import { CatalogsRoutingModule } from './catalogs-routing.module';



@NgModule({
  declarations: [
    CatalogsComponent,
    RoomsComponent
  ],
  imports: [
    CommonModule,
    CatalogsRoutingModule
  ]
})
export class CatalogsModule { }
