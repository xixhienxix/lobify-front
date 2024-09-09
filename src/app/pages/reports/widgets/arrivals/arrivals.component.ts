import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { Codigos } from 'src/app/models/codigos.model';
import { Habitacion } from 'src/app/models/habitaciones.model';
import { Huesped, reservationStatusMap } from 'src/app/models/huesped.model';
import { Tarifas } from 'src/app/models/tarifas';
import { Estatus } from 'src/app/pages/calendar/_models/estatus.model';
import { HouseKeeping } from 'src/app/pages/calendar/_models/housekeeping.model';
import { Parametros } from 'src/app/pages/parametros/_models/parametros';
import { DashboardService } from 'src/app/services/_shared/dashboard.service';

@Component({
  selector: 'app-arrivals',
  templateUrl: './arrivals.component.html',
  styleUrls: ['./arrivals.component.scss']
})
export class ArrivalsComponent implements OnInit{
  llegadasDelDia: number;
  yaLlegaron: Huesped[] = [];
  porLlegar: Huesped[] = [];
  @Input() changing: Subject<Huesped[]>;

  @Input() color: string = '';
  @Input() allReservations: Huesped[] = [];
  @Input() houseKeepingCodes: HouseKeeping[] = [];
  @Input() codigosCargo: Codigos[] = [];
  @Input() estatusArray: Estatus[] = [];
  @Input() ratesArrayComplete: Tarifas[] = [];
  @Input() roomCodesComplete: Habitacion[] = [];
  @Input() parametrosModel: Parametros;
  
  customers!: any[];

  constructor(
    private translateService:TranslateService, 
    private cdr: ChangeDetectorRef,
    private _dashboardService:DashboardService
      ){
    this.translateService.use('es');
  }

  async ngOnInit() {
    this.changing.subscribe({
      next:async (dataSource)=>{
        this.allReservations = [...dataSource];
        this.processReservations();
        this.cdr.detectChanges(); // Manually trigger change detection if needed

      }
    })
  }

  processReservations() {
    const today= new Date();
    const arrivals = this._dashboardService.filterReservationsByArrivalDate(this.allReservations, today);
    this.yaLlegaron = arrivals[1];
    this.porLlegar = arrivals[2];
    this.llegadasDelDia = arrivals[1].length + arrivals[2].length
  }
}
