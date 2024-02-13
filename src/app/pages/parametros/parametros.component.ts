import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Divisas } from './_models/divisas';
import { TimeZones } from './_models/timezone';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TimezonesService } from './_services/timezones.service';
import { DivisasService } from './_services/divisas.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { ParametrosService } from './_services/parametros.service';
import { AlertsComponent } from 'src/app/_metronic/shared/alerts/alerts.component';
import { Parametros } from './_models/parametros';

@Component({
  selector: 'app-parametros',
  templateUrl: './parametros.component.html',
  styleUrls: ['./parametros.component.scss']
})
export class ParametrosComponent  {

constructor(
  
) { 
  
}


}

