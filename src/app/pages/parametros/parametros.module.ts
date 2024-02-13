import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParametrosComponent } from './parametros.component';
import { SharedModule } from '../../_metronic/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { ParametrosMainComponent } from './parametros.main/parametros.main.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    ParametrosComponent,
    ParametrosMainComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatCheckboxModule,
    RouterModule.forChild([
      {
        path: '',
        component: ParametrosComponent,
      }
    ]),

  ]
})
export class ParametrosModule { }
