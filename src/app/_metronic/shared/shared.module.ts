import {NgModule} from '@angular/core';
import {KeeniconComponent} from './keenicon/keenicon.component';
import {CommonModule} from "@angular/common";
import { TranslateModule } from '@ngx-translate/core';
import { LoadingSpinnerComponent } from 'src/app/services/_helpers/loaderspinner/loaderspinner.component';
import { PaginatorComponent } from './paginator/paginator.component';
import { SortIconComponent } from './sort-icon/sort-icon.component';
import { AlertsComponent } from './alerts/alerts.component';
import { NgPagination } from './paginator/ng-pagination/ng-pagination.component';
import { FormsModule } from '@angular/forms';
import { InlineSVGModule } from 'ng-inline-svg-2';

@NgModule({
  declarations: [
    KeeniconComponent,
    LoadingSpinnerComponent,
    PaginatorComponent,
    SortIconComponent,
    AlertsComponent,
    NgPagination,
  ],
  imports: [
    CommonModule,
    FormsModule,
    InlineSVGModule
  ],
  exports: [
    KeeniconComponent,
    TranslateModule,
    LoadingSpinnerComponent,
    PaginatorComponent,
    SortIconComponent,
    AlertsComponent
  ]
})
export class SharedModule {
}
