import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-departures',
  templateUrl: './departures.component.html',
  styleUrls: ['./departures.component.scss']
})
export class DeparturesComponent {
  constructor(private translateService : TranslateService){
    this.translateService.use('es')
  }
}
