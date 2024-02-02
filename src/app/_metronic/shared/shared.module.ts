import {NgModule} from '@angular/core';
import {KeeniconComponent} from './keenicon/keenicon.component';
import {CommonModule} from "@angular/common";
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    KeeniconComponent
  ],
  imports: [
    CommonModule,
    
  ],
  exports: [
    KeeniconComponent,
    TranslateModule,
    
  ]
})
export class SharedModule {
}
