import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableWidget11Component } from './table-widget11/table-widget11.component';
import { SharedModule } from '../_metronic/shared/shared.module';



@NgModule({
  declarations: [    TableWidget11Component  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports:  [
    TableWidget11Component
  ]
})
export class WidgetsModule { }
