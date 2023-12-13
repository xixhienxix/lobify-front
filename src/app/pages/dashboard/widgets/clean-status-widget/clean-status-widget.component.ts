import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-clean-status-widget',
  templateUrl: './clean-status-widget.component.html',
  styleUrls: ['./clean-status-widget.component.scss']
})
export class CleanStatusWidgetComponent {
  constructor(private translateService: TranslateService){
    this.translateService.use('es');
  }
}
