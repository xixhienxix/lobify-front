import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { CalendarComponent } from './calendar.component';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { HeaderComponent } from './components/header/header.component';
import { ContentComponent } from './components/content/content.component';
import { FooterComponent } from './components/footer/footer.component';
import { GanttComponent } from './components/gantt/gantt.component';



@NgModule({
  declarations: [CalendarComponent, HeaderComponent, ContentComponent, FooterComponent, GanttComponent],
  imports: [
    TranslateModule,
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: CalendarComponent,
      }
    ]),
  ]
})
export class CalendarModule { }
