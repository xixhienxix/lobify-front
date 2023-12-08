import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-arrivals',
  templateUrl: './arrivals.component.html',
  styleUrls: ['./arrivals.component.scss']
})
export class ArrivalsComponent {
  @Input() color: string = '';
  customers!: any[];

  constructor(private translateService:TranslateService){
    this.translateService.use('es');
  }

  ngOnInit(){
    
  }
}
